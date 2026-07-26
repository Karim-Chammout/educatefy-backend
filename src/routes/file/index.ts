import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { authenticated } from '../../middleware/authenticated.js';
import { fileUploadLimiter } from '../../middleware/rateLimiter.js';
import { ErrorType } from '../../utils/ErrorType.js';
import { fileUploadHandler } from './fileUploadController.js';

const fileRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const DESTINATION_FOLDER_PATTERN = /^[a-zA-Z0-9_\-/]+$/;

const validateDestinationFolder = (req: Request, res: Response, next: NextFunction) => {
  const { destinationFolder } = req.body;

  if (!destinationFolder) {
    res.status(400).json({ message: ErrorType.NO_FILE_PATH_PROVIDED });
    return;
  }

  if (destinationFolder.includes('..') || !DESTINATION_FOLDER_PATTERN.test(destinationFolder)) {
    res.status(400).json({ message: ErrorType.INVALID_INPUT });
    return;
  }

  next();
};

fileRouter.post(
  '/upload',
  fileUploadLimiter,
  authenticated,
  (req: Request, _res: Response, next: NextFunction) => {
    upload.single('file')(req, _res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          _res.status(413).json({ message: ErrorType.INVALID_INPUT });
          return;
        }
        _res.status(400).json({ message: ErrorType.INVALID_INPUT });
        return;
      }
      next();
    });
  },
  validateDestinationFolder,
  fileUploadHandler,
);

export default fileRouter;
