import multer from "multer";

interface MulterConfig {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}
const defaultMaxSize = 5 * 1024 * 1024;
const defaultMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
const createMulterUploader = ({
  maxFileSize = defaultMaxSize,
  allowedMimeTypes = defaultMimeTypes,
}: MulterConfig = {}) => {
  const storage = multer.memoryStorage();

  return multer({
    storage: storage,
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type."));
      }
    },
  });
};

export { createMulterUploader };
