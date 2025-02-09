import express from "express";
import { scrapeAndSave } from "./scrapeAndSave.mjs";

const app = express();
app.use(express.json());

app.post("/api/scrape", async (req, res) => {
  const { jobTitle, location, sheetId } = req.body;

  if (!jobTitle || !location || !sheetId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await scrapeAndSave(jobTitle, location, sheetId);
    res.json({ message: "Jobs scraped and saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
