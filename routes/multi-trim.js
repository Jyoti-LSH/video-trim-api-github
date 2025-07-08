const express = require("express");
const path = require("path");
const { downloadVideo, processClips } = require("../clipProcessor");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/", async (req, res) => {
  const { video_url, clips } = req.body;
  if (!video_url || !Array.isArray(clips)) {
    return res.status(400).json({ error: "Missing video_url or clips array" });
  }

  const inputPath = path.join(__dirname, `../input_${uuidv4()}.mp4`);

  try {
    await downloadVideo(video_url, inputPath);
    const results = await processClips(inputPath, clips);
    fs.unlinkSync(inputPath);
    res.json(results);
  } catch (err) {
    console.error("Multi-trim error:", err);
    res.status(500).json({ error: "Failed to process clips" });
  }
});

module.exports = router;
