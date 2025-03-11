import express from "express";
import puppeteer from "puppeteer";
// import { saveToExcel } from "../libs/SaveToExcel";
import { saveToGoogleSheet } from "../libs/SaveToGoogleSheet";
import SaveToExcel from "../libs/SaveToExcel";

const ScraperControllers = express.Router();

ScraperControllers.post(`/scrape-create`, async (req, res) => {
  try {
    const { url } = req.body;
    let browser;
    let page;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Jika browser belum dibuat, buat browser dan halaman baru
    if (!browser) {
      browser = await puppeteer.launch({ headless: false });
      page = await browser.newPage();
    }

    // Fungsi untuk melakukan scraping
    async function scrapeAndUpdate() {
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

      await saveToGoogleSheet(result);
      // await SaveToExcel(result);
      console.log("Data updated at", new Date().toLocaleTimeString());
    }

    // Jalankan pertama kali
    await scrapeAndUpdate();

    // Set interval setiap 1 menit
    setInterval(async () => {
      await scrapeAndUpdate();
    }, 60000); // 60000 ms = 1 menit

    res.status(200).json({
      success: true,
      message: "Scraping dimulai dan akan diperbarui setiap 5 menit",
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
