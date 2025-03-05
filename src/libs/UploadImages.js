import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../public/files");

// Pastikan folder ada sebelum upload
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const UploadFile = multer({
  storage: uploadStorage,
  // fileFilter: (req, file, cb) => {
  //   const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  //   if (allowedTypes.includes(file.mimetype)) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Only .png, .jpg and .jpeg formats are allowed!"), false);
  //   }
  // }
});

export default UploadFile;
