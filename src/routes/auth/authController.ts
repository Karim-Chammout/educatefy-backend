import { Request, Response } from 'express';

import { db } from '../../db';
import { ErrorType } from '../../utils/ErrorType';
import createOrUpdateAccount from './createOrUpdateAccount';
import { getOidcClient, providers } from './oidc';

export const redirectToProvider = async (req: Request, res: Response) => {
  try {
    const { userRole } = req.query;
    const { oidcID } = req.params;

    const openidClientConfig = await db('openid_client').where('id', oidcID).first();

    if (!openidClientConfig) {
      throw new Error(ErrorType.OIDC_NOT_FOUND);
    }

    const authClient = await getOidcClient(openidClientConfig.identity_provider);

    const authUrl = authClient.authorizationUrl({
      scope: 'openid email profile',
      prompt: 'login', // Force login if user is not already authenticated
      state: JSON.stringify({ oidcID, userRole }),
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('OIDC client not initialized: ', error);
    res.status(500).json({ message: ErrorType.INTERNAL_SERVER_ERROR });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { oidcID } = req.params;
    const { state } = req.body;
    const stateInfo = JSON.parse(state);
    const userRole = stateInfo.userRole;

    if (!state) {
      console.error('Invalid state parameter');
      res.status(400).json({ message: ErrorType.INVALID_STATE });
      return;
    }

    const openidClientConfig = await db('openid_client').where('id', oidcID).first();

    if (!openidClientConfig) {
      console.error('Invalid provider callback');
      res.status(400).json({ message: ErrorType.OIDC_INVALID_PROVIDER });
      return;
    }

    const provider = openidClientConfig.identity_provider;

    const authClient = await getOidcClient(provider);

    const tokens = await authClient.callback(providers[provider].redirect_uri, req.body, {
      state: state,
    });

    if (tokens.access_token) {
      const userinfo = await authClient.userinfo(tokens.access_token);

      // Create an account entry in the database
      await createOrUpdateAccount(userinfo, provider, userRole);
    }
  } catch (error: any) {
    console.error('Failed to handle OIDC callback => ', error);
    let message = `${ErrorType.INTERNAL_SERVER_ERROR}`;
    if (error.message.includes(ErrorType.SIGN_UP_FIRST)) {
      message += ` ${ErrorType.SIGN_UP_FIRST}`;
    }
    res.status(500).json({ message });
  }
};
