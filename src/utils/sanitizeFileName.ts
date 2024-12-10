export const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase();
};
