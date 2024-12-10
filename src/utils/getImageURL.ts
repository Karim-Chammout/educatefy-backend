import config from '../config';

export const getImageURL = (key: string) => {
  const bucketName = config.S3_BUCKET_NAME;
  const bucketPathPrefix = config.S3_PATH_PREFIX;

  return `${bucketPathPrefix}/${bucketName}/${key}`;
};
