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
};

export default config;
