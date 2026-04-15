import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { Stream } from "stream"; // Import Stream module

let uploadedImageUrl;
let publicId;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function upload(filePath: any, options: any = {}) {
  try {
    const defaultOptions = {
      use_filename: true,
      unique_filename: false,
      resource_type: "auto",
      folder: "xira",
    };

    const uploadOptions = { ...defaultOptions, ...options };

    const uploadToCloudinary = await cloudinary.uploader.upload(
      filePath,
      uploadOptions
    );

    uploadedImageUrl = uploadToCloudinary.secure_url;
    publicId = uploadToCloudinary.public_id;

    return { uploadedImageUrl, publicId };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Renamed function for uploading buffers (e.g., audio, files)
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: any = {}
) {
  try {
    const uploadOptions = {
      folder: "voice_messages", // Default folder, can be overridden
      resource_type: "raw", // Treat as raw binary data by default
      ...options, // Allow overriding of these options
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: any, result: any) => {
          if (result) {
            uploadedImageUrl = result.secure_url;
            publicId = result.public_id;
            resolve({ uploadedImageUrl, publicId });
          } else {
            console.log(error);
            reject(error);
          }
        }
      );
      const bufferStream = new Stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function removeImageFromCloudinary(url: any) {
  try {
    const publicIdOfThumbURL = extractPublicIdFromUrl(url);
    await cloudinary.uploader.destroy(publicIdOfThumbURL);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export function extractPublicIdFromUrl(url: string): string {
  const pathSegments: string[] = new URL(url).pathname.split("/");
  const publicId = pathSegments[pathSegments.length - 1].split(".")[0];
  return decodeURIComponent(publicId);
}
