const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * Download a video from a URL to a local file using FFmpeg
 */
function downloadVideo(videoUrl, outputPath) {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting download from:", videoUrl);

    ffmpeg(videoUrl)
      .outputOptions("-c:v copy", "-c:a copy")
      .on("start", (cmd) => {
        console.log("🛠 FFmpeg started with command:\n", cmd);
      })
      .on("end", () => {
        console.log("✅ Download complete:", outputPath);
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error("❌ FFmpeg download error:", err.message || err);
        console.error("📄 FFmpeg stderr:\n", stderr);
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Process multiple clips from an input video
 */
function processClips(inputPath, clips) {
  return Promise.all(
    clips.map((clip, index) => {
      return new Promise((resolve, reject) => {
        const outputF
