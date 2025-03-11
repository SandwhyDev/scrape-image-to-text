import { google } from "googleapis";
import fs from "fs";
import path from "path";

const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, "../../analog-hull-284010-ccea5608e83c.json")));

export const saveToGoogleSheet = async (data) => {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "1fTfzfRt8eUxFQT0Ynx9-zc7AQG0AUaeYzWov6fM6sRY"; // ID Google Sheet
  const sheetName = "11-03-2025 11.05.25"; // Sesuaikan dengan nama sheet yang sudah ada

  // **CARI SHEET ID BERDASARKAN NAMA SHEET**
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetMeta.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) {
    console.error(`Sheet dengan nama "${sheetName}" tidak ditemukan.`);
    return;
  }
  const sheetId = sheet.properties.sheetId;

  const headerRow = ["Country", "15m", "1h", "4h", "1d", "1w", "1m", "1y"];
  const dataRows = data.map((item) => [item.symbol, ...item.values.map((v) => "")]);

  // **Hapus isi sheet sebelum diisi ulang**
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A1:Z1000`,
  });

  // **Simpan data baru ke Google Sheets**
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1:H${dataRows.length + 1}`,
    valueInputOption: "RAW",
    resource: { values: [headerRow, ...dataRows] },
  });

  // **Warna untuk tiap sel berdasarkan `background`**
  const dataCellFormats = data
    .map((item, rowIndex) =>
      item.values.map((value, colIndex) => ({
        repeatCell: {
          range: {
            sheetId, // Gunakan Sheet ID yang benar
            startRowIndex: rowIndex + 1,
            endRowIndex: rowIndex + 2,
            startColumnIndex: colIndex + 1,
            endColumnIndex: colIndex + 2,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: extractRgb(value.background),
            },
          },
          fields: "userEnteredFormat(backgroundColor)",
        },
      }))
    )
    .flat();

  // **Kirim batch update untuk pewarnaan**
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId, // Gunakan Sheet ID yang benar
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        ...dataCellFormats,
      ],
    },
  });

  console.log(`Data berhasil diperbarui di sheet "${sheetName}" dengan ID ${sheetId}.`);
  return true;
};

// Fungsi konversi HEX ke RGB untuk Google Sheets API
const extractRgb = (rgbString) => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;

  return {
    red: parseInt(match[1]) / 255,
    green: parseInt(match[2]) / 255,
    blue: parseInt(match[3]) / 255,
  };
};
