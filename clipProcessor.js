const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Downloads a video from a given URL and saves it to a specified path.
 * @param {string} url - The video URL.
 * @param {string} outputPath - Where to save the downloaded video.
 */
function downloadVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { quality: "highest" })
      .pipe(fs.createWriteStream(outputPath));

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
}

/**
 * Trims a video into multiple clips.
 * @param {string} inputPath - The source video file.
 * @param {Array<{start: string, end: string}>} clips - Array of start/end timestamps.
 * @returns {Promise<Array<{ clipPath: string }>>}
 */
async function processClips(inputPath, clips) {
  const outputDir = path.dirname(inputPath);
  const processedClips = [];

  for (let index = 0; index < clips.length; index++) {
    const { start, end } = clips[index];
    const outputFile = path.join(outputDir, `clip_${uuidv4()}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(getDuration(start, end))
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
 * Calculates duration between start and end timestamps (format: HH:MM:SS).
 */
function getDuration(start, end) {
  const toSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(":").map(Number);
    return h * 3600 + m *
