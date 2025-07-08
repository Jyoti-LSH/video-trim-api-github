const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

/**
 * Downloads video from a URL to a local file.
 */
async function downloadVideo(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Trims the input video into multiple clips.
 */
async function processClips(inputPath, clips) {
  const outputDir = path.dirname(inputPath);
  const processedClips = [];

  for (let index = 0; index < clips.length; index++) {
    const { start, end } = clips[index];
    const duration = getDuration(start, end);
    const outputFile = path.join(outputDir, `clip_${uuidv4()}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(duration)
        .output(outputFile)
        .on("end", () => {
          console.log(`✅ Clip ${index + 1} processed: ${outputFile}`);
          processedClips.push({ clipPath: outputFile });
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error(`❌ Error trimming clip ${index + 1}:`, err.message);
          console.error("📄 FFmpeg stderr:\n", stderr);
          reject(err);
        })
        .run();
    });
  }

  return processedClips;
}

/**
 * Calculates duration between two timestamps in format HH:MM:SS.
 */
function getDuration(start, end) {
  const toSeconds = (time) => {
    const [h, m, s] = time.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  return toSeconds(end) - toSeconds(start);
}

module.exports = {
  downloadVideo,
  processClips,
};
