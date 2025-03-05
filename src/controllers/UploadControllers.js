import express from "express";
import UploadFile from "../libs/UploadImages";
import Tesseract from "tesseract.js";
const UploadControllers = express.Router();
import path from "path";
import fs from "fs";

// const model = models_prisma;
const formatReceiptText = (text) => {
  return text
    .split("\n") // Pecah per baris
    .map((line) => line.trim()) // Hilangkan spasi di awal/akhir tiap baris
    .filter((line) => line !== "") // Hilangkan baris kosong
    .join("\n"); // Gabungkan kembali dengan newline
};

// create
UploadControllers.post(`/upload-create`, UploadFile.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const imagePath = path.resolve(file.path);

    // Jalankan OCR dengan Tesseract.js
    const { data } = await Tesseract.recognize(imagePath, "eng");

    // Path untuk menyimpan hasil OCR sebagai TXT
    const uploadDir = path.join(__dirname, "../../public/upload");

    // Pastikan folder `uploads/` ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const textFileName = `output_${Date.now()}.txt`;
    const textFilePath = path.join(uploadDir, textFileName);

    const formattedText = formatReceiptText(data.text);
    fs.writeFileSync(textFilePath, formattedText, "utf8");

    // Hapus file gambar setelah diproses
    fs.unlinkSync(imagePath);

    res.status(201).json({
      success: true,
      message: "Berhasil",
      text: data.text,
      filePath: textFilePath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// read
UploadControllers.get(`/upload-read/:uid?`, async (req, res) => {
  try {
    const { uid } = await req.params;
    var result;

    if (uid) {
      const find = await model.findUnique({
        where: {
          id: uid,
        },
      });

      if (!find) {
        res.status(200).json({
          success: false,
          message: "data tidak ditemukan",
        });
        return;
      }

      result = find;
    } else {
      const find = await model.findMany();
      result = find;
    }

    res.status(200).json({
      success: true,
      message: "berhasil",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// update
UploadControllers.put(`/upload-update/:uid`, async (req, res) => {
  try {
    const { uid } = await req.params;
    const data = await req.body;

    const update = await model.update({
      where: {
        id: uid,
      },
      data: data,
    });

    res.status(200).json({
      success: true,
      message: "berhasil update",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// delete
UploadControllers.delete(`/upload-delete/:uid`, async (req, res) => {
  try {
    const { uid } = await req.params;

    const hapus = await model.delete({
      where: {
        id: uid,
      },
    });

    res.status(200).json({
      success: true,
      message: "berhasil update",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default UploadControllers;
