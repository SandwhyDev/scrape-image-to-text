import express from "express";
import puppeteer from "puppeteer";
import ExcelJS from "exceljs";
import path from "path";
import { rgbToHex } from "../libs/rgbToHex";

const ScraperControllers = express.Router();

// create
ScraperControllers.post(`/scrape-create`, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const result = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("tr")).map((row) => {
        return {
          symbol: row.querySelector("td._symbolColumn_10f6j_43 ._symbol_gw123_38")?.innerText.trim() || null,
          values: Array.from(row.querySelectorAll("td._cell_10f6j_87")).map((cell) => ({
            title: cell.getAttribute("title"),
            background: window.getComputedStyle(cell).background,
          })),
        };
      });
    });

    await browser.close();

    // **Simpan ke Excel**
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

    res.status(200).json({
      success: true,
      message: "Scraping berhasil, data disimpan ke Excel",
      filePath: `/upload/heat-map.xlsx`,
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// read
ScraperControllers.get(`/scrape-read/:uid?`, async (req, res) => {
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
ScraperControllers.put(`/scrape-update/:uid`, async (req, res) => {
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
ScraperControllers.delete(`/scrape-delete/:uid`, async (req, res) => {
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

export default ScraperControllers;
