function getEnvVar(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Error: Environment variable ${key} missing.`);
  }

  return value;
}

function getOptionalEnvVar(key: string, fallback: string) {
  const value = process.env[key];

  if (value === undefined || value === '') {
    return fallback;
  }

  return value;
}

const config = {
  APP_ENV: getEnvVar('APP_ENV'),
  PORT: getEnvVar('PORT'),
  LOG_LEVEL: getEnvVar('LOG_LEVEL'),
  APP_URL: getOptionalEnvVar('APP_URL', 'http://localhost:5173'),
  DATABASE_HOST: getEnvVar('DATABASE_HOST'),
  DATABASE_NAME: getEnvVar('DATABASE_NAME'),
  DATABASE_USER: getEnvVar('DATABASE_USER'),
  DATABASE_PASSWORD: getEnvVar('DATABASE_PASSWORD'),
  DATABASE_PORT: getEnvVar('DATABASE_PORT'),
  GOOGLE_OIDC_ISSUER: getEnvVar('GOOGLE_OIDC_ISSUER'),
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnvVar('GOOGLE_REDIRECT_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  S3_PROJECT_URL: getEnvVar('S3_PROJECT_URL'),
  S3_API_KEY: getEnvVar('S3_API_KEY'),
  S3_BUCKET_NAME: getEnvVar('S3_BUCKET_NAME'),
  S3_PATH_PREFIX: getEnvVar('S3_PATH_PREFIX'),
  MAIL_FROM: getEnvVar('MAIL_FROM'),
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY'),
};

export default config;
