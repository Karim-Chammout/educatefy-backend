function getEnvVar(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Error: Environment variable ${key} missing.`);
  }

  return value;
}

const config = {
  APP_ENV: getEnvVar('APP_ENV'),
  PORT: getEnvVar('PORT'),
  DATABASE_NAME: getEnvVar('DATABASE_NAME'),
  DATABASE_USER: getEnvVar('DATABASE_USER'),
  DATABASE_PASSWORD: getEnvVar('DATABASE_PASSWORD'),
  DATABASE_PORT: getEnvVar('DATABASE_PORT'),
  GOOGLE_OIDC_ISSUER: getEnvVar('GOOGLE_OIDC_ISSUER'),
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REDIRECT_URI: getEnvVar('GOOGLE_REDIRECT_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  SUPABASE_PROJECT_URL: getEnvVar('SUPABASE_PROJECT_URL'),
  SUPABASE_API_KEY: getEnvVar('SUPABASE_API_KEY'),
  SUPABASE_BUCKET_NAME: getEnvVar('SUPABASE_BUCKET_NAME'),
};

export default config;
