import { Issuer } from 'openid-client';

import config from '../../config';
import { ErrorType } from '../../utils/ErrorType';

type ProviderConfigType = {
  issuer: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
};

export const providers: { [key: string]: ProviderConfigType } = {
  google: {
    issuer: config.GOOGLE_OIDC_ISSUER,
    client_id: config.GOOGLE_CLIENT_ID,
    client_secret: config.GOOGLE_CLIENT_SECRET,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
  },
};

export const getOidcClient = async (provider: string) => {
  const providerConfig = providers[provider];

  try {
    const issuer = await Issuer.discover(providerConfig.issuer);
    const authClient = new issuer.Client({
      client_id: providerConfig.client_id,
      client_secret: providerConfig.client_secret,
      redirect_uri: providerConfig.redirect_uri,
      response_types: ['code'],
    });

    return authClient;
  } catch (error) {
    console.error('Failed to discover OpenID issuer: ', error);
    throw new Error(ErrorType.OIDC_INITIALIZE_FAILED);
  }
};
