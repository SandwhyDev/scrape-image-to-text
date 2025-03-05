import express from "express";
import Scraper from "scraperjs";

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

    Scraper.DynamicScraper.create(url)
      .scrape(($) => {
        return $("tr")
          .map(function () {
            return {
              symbol: $(this).find("td._symbolColumn_10f6j_43 ._symbol_gw123_38").text().trim(),
              values: $(this)
                .find("td._cell_10f6j_87")
                .map(function () {
                  return {
                    title: $(this).attr("title"),
                    background: $(this).css("background"),
                    width: $(this).css("width"),
                  };
                })
                .get(),
            };
          })
          .get();
      })
      .then((result) => {
        res.status(201).json({
          success: true,
          message: "Scraping berhasil",
          data: result,
        });
      })
      .catch((err) => {
        console.error(err.message);
        res.status(500).json({
          success: false,
          error: err.message,
        });
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
