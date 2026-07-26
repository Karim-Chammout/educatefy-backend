import { Request, Response } from 'express';
import * as client from 'openid-client';

import config from '../../config.js';
import { db } from '../../db/index.js';
import { formatDateTZ } from '../../utils/formatDateWithTZ.js';
import { ErrorType } from '../../utils/ErrorType.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import createOrUpdateAccount from './createOrUpdateAccount.js';
import { getOidcConfig, providers } from './oidc.js';

const VALID_USER_ROLES = ['student', 'teacher'];

export const redirectToProvider = async (req: Request, res: Response) => {
  try {
    const { userRole } = req.query;
    const { oidcID } = req.params;

    if (userRole && !VALID_USER_ROLES.includes(userRole as string)) {
      res.status(400).json({ message: ErrorType.INVALID_INPUT });
      return;
    }

    const openidClientConfig = await db('openid_client').where('id', oidcID).first();

    if (!openidClientConfig) {
      throw new Error(ErrorType.OIDC_NOT_FOUND);
    }

    const state = JSON.stringify({ oidcID, userRole });

    const provider = openidClientConfig.identity_provider;
    const oidcConfig = await getOidcConfig(provider);

    const redirectTo = client.buildAuthorizationUrl(oidcConfig, {
      redirect_uri: providers[provider].redirect_uri,
      scope: 'openid email profile',
      prompt: 'login',
      state,
    });

    res.redirect(redirectTo.href);
  } catch (error) {
    console.error('OIDC client not initialized: ', error);
    res.status(500).json({ message: ErrorType.INTERNAL_SERVER_ERROR });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { oidcID } = req.params;
    const { state } = req.body;

    if (!state) {
      console.error('Invalid state parameter');
      res.status(400).json({ message: ErrorType.INVALID_STATE });
      return;
    }

    const stateInfo = JSON.parse(state);
    const userRole = stateInfo.userRole;

    const openidClientConfig = await db('openid_client').where('id', oidcID).first();

    if (!openidClientConfig) {
      console.error('Invalid provider callback');
      res.status(400).json({ message: ErrorType.OIDC_INVALID_PROVIDER });
      return;
    }

    const provider = openidClientConfig.identity_provider;
    const oidcConfig = await getOidcConfig(provider);
    const redirectUri = providers[provider].redirect_uri;

    // Reconstruct the full callback URL with query params from the POST body
    const callbackUrl = new URL(redirectUri);
    for (const [key, value] of Object.entries(req.body)) {
      callbackUrl.searchParams.set(key, value as string);
    }

    // Google doesn't include `iss` in the callback, but openid-client v6
    // requires it when the discovery doc advertises
    // `authorization_response_iss_parameter_supported: true`.
    // Manually inject it from the known issuer to satisfy the validation.
    if (!callbackUrl.searchParams.has('iss')) {
      callbackUrl.searchParams.set('iss', providers[provider].issuer);
    }

    const tokens = await client.authorizationCodeGrant(oidcConfig, callbackUrl, {
      expectedState: state,
    });

    if (tokens.access_token) {
      const idTokenClaims = tokens.claims();

      const userinfo = await client.fetchUserInfo(
        oidcConfig,
        tokens.access_token,
        idTokenClaims!.sub,
      );

      const account = await createOrUpdateAccount(userinfo, provider, userRole);

      if (account) {
        try {
          const accessToken = generateAccessToken(account.id);
          const refreshToken = await generateRefreshToken(account.id, db, req.headers, req.ip);

          const isProduction = config.APP_ENV === 'production';
          res.cookie('jwt', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
            maxAge: 3600 * 1000,
          });

          res.json({ refreshToken });
          return;
        } catch (error) {
          console.error('Failed to generate tokens:', error);
          res.status(500).json({ message: ErrorType.INTERNAL_SERVER_ERROR });
          return;
        }
      }

      res.status(500).json({ message: ErrorType.INTERNAL_SERVER_ERROR });
      return;
    }
  } catch (error: any) {
    console.error('Failed to handle OIDC callback => ', error);
    let message = ErrorType.INTERNAL_SERVER_ERROR;
    if (error.message?.includes(ErrorType.SIGN_UP_FIRST)) {
      message = ErrorType.SIGN_UP_FIRST;
    }
    res.status(500).json({ message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.headers.refreshtoken as string | undefined;

  if (refreshToken) {
    await db('refresh_token')
      .where('token', refreshToken)
      .update({ revoked_at: formatDateTZ(new Date()) });
  }

  const isProduction = config.APP_ENV === 'production';
  res.clearCookie('jwt', {
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.json({ success: true });
};
