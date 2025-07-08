const fs = require("fs");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// 🔹 Download video from any direct URL (e.g., Google Drive export link)
async function downloadVideo(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// 🔹 Process multiple clips
async function processClips(inputPath, clips) {
  const results = [];

  for (let index = 0; index < clips.length; index++) {
    const { start, end } = clips[index];
    const outputFilename = `clip_${uuidv4()}.mp4`;
    const outputPath = path.join(__dirname, outputFilename);

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(start)
          .setDuration(getDuration(start, end))
          .output(outputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const base64Data = fs.readFileSync(outputPath, { encoding: "base64" });
      fs.unlinkSync(outputPath); // Clean up trimmed file

      results.push({
        index,
        filename: outputFilename,
        base64: base64Data,
      });
    } catch (err) {
      console.error(`❌ Error trimming clip ${index}:`, err.message);
      results.push({ index, error: err.message });
    }
  }

  return results;
}

// 🔹 Helper to get clip duration
function getDuration(start, end) {
  const startSecs = timeToSeconds(start);
  const endSecs = timeToSeconds(end);
  return endSecs - startSecs;
}

// 🔹 Convert HH:MM:SS to seconds
function timeToSeconds(timeStr) {
  const parts = timeStr.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

module.exports = {
  downloadVideo,
  processClips,
};
