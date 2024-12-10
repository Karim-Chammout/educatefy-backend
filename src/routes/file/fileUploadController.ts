import { Request, Response } from 'express';

import { ErrorType } from '../../utils/ErrorType';
import { uploadFile } from '../../utils/fileStorageHandler';
import { sanitizeFileName } from '../../utils/sanitizeFileName';

export const fileUploadHandler = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: ErrorType.NO_FILE_UPLOADED });
    return;
  }

  if (!req.body.destinationFolder) {
    res.status(400).json({ message: ErrorType.NO_FILE_PATH_PROVIDED });
    return;
  }

  try {
    const destinationFolderName = req.body.destinationFolder;
    const sanitizedFileName = sanitizeFileName(req.file.originalname);
    const fileName = `${Date.now()}-${sanitizedFileName}`;

    const uploadedFile = await uploadFile(
      `uploads/${destinationFolderName}/${fileName}`,
      req.file.buffer,
    );

    res.json({
      success: true,
      uuid: uploadedFile.id,
      filePath: uploadedFile.path,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });
    return;
  } catch (error) {
    console.error('Error uploading file: ', error);
    res.status(500).json({ success: false, message: ErrorType.UPLOADING_FILE_FAILED });
    return;
  }
};
