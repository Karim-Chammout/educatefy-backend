import { deleteFile, getFile, getFileUrl, uploadFile } from '../../../utils/fileStorageHandler';

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
