import ExcelJS from "exceljs";
import path from "path";
import { rgbToHex } from "./rgbToHex";

const SaveToExcel = async (result) => {
  const workbook = new ExcelJS.Workbook();
  const date = new Date();
  const formattedDate = date
    .toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(",", "")
    .replace(/[/:]/g, "-");

  const worksheet = workbook.addWorksheet(formattedDate);

  // Header dengan Timeframe
  worksheet.columns = [
    { header: "Country", key: "country", width: 15 },
    { header: "15m", key: "time_15m", width: 15 },
    { header: "1h", key: "time_1h", width: 15 },
    { header: "4h", key: "time_4h", width: 15 },
    { header: "1d", key: "time_1d", width: 15 },
    { header: "1w", key: "time_1w", width: 15 },
    { header: "1m", key: "time_1m", width: 15 },
    { header: "1y", key: "time_1y", width: 15 },
  ];

  // Isi Data
  result.forEach((item) => {
    if (item.symbol) {
      const row = worksheet.addRow({ country: item.symbol });

      // Pastikan ada cukup nilai untuk tiap timeframe
      const timeframes = ["time_15m", "time_1h", "time_4h", "time_1d", "time_1w", "time_1m", "time_1y"];

      item.values.forEach((value, index) => {
        if (index < timeframes.length) {
          const hexColor = rgbToHex(value.background);
          const cell = row.getCell(index + 2); // Kolom dimulai dari index 2 setelah "Symbol"
          // cell.value = value.background.split(")")[0] + ")" || "-";

          if (hexColor) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: hexColor.replace("#", "") }, // Hapus "#" karena ExcelJS pakai ARGB
            };
          }
        }
      });
    }
  });

  // Simpan File Excel
  const filePath = path.join(__dirname, "../../public/upload/heat-map.xlsx");
  await workbook.xlsx.writeFile(filePath);
};

export default SaveToExcel;
