import multer from "multer";
import { Request } from "express";
import path from "path";
import { fileFilter, videoLimits, imageLimit } from "./multer.util";
import crypto from "crypto";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const filePath = path.resolve(__dirname, "../../../", "public");

export const distStorage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: DestinationCallback
  ): void => {
    callback(null, filePath);
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: FileNameCallback
  ): void => {
    const uniqueId = crypto.randomUUID();
    let fileName = `${file.fieldname}-${uniqueId}.${file.originalname
      .split(".")
      ?.pop()}`;
    callback(null, fileName);
  },
});

export const avatar = multer({
  storage: distStorage,
  fileFilter: fileFilter,
  limits: imageLimit,
}).single("avatar");
