import { createClient } from '@supabase/supabase-js';

import config from '../../../config';

const bucketName = config.SUPABASE_BUCKET_NAME;

const supabase = createClient(config.SUPABASE_PROJECT_URL, config.SUPABASE_API_KEY);

export const getFile = async (path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).download(path);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getFileUrl = async (path: string) => {
  try {
    const oneMonthInSeconds = 1 * 60 * 60 * 24 * 30;
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, oneMonthInSeconds);

    return data ? data.signedUrl : null;
  } catch (error) {
    throw error;
  }
};

export const uploadFile = async (path: string, file: Buffer) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).upload(path, file);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export type FsContext = {
  getFile: typeof getFile;
  getFileUrl: typeof getFileUrl;
  uploadFile: typeof uploadFile;
  deleteFile: typeof deleteFile;
};

export function createFsContext() {
  return {
    getFile,
    getFileUrl,
    uploadFile,
    deleteFile,
  };
}
