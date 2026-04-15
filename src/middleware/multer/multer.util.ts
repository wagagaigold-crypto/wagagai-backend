import { Request } from "express";
import { FileFilterCallback } from "multer";
import path from "path";

export const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  const validExtensions = [
    ".jpeg",
    ".jpg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".tif",
    ".webp",
    ".svg",
    ".cr2",
    ".nef",
    ".arw",
  ];
  
  const extension = path.extname(file.originalname);

  if (validExtensions.includes(extension.toLowerCase())) {
    callback(null, true);
  } else {
    console.log("File is not allowed");
    callback(null, false);
  }
};

export const videoLimits = {
  fileSize: 100 * 1024 * 1024, // 100mb
};

export const imageLimit = {
  fileSize: 100 * 1024 * 1024, // 100mb
};
