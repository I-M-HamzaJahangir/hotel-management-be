import { cloudinary } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload failed."));
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export { uploadToCloudinary, deleteFromCloudinary };
