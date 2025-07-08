const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

function downloadVideo(videoUrl, outputPath) {
  return new Promise((resolve, reject) => {
    console.log("🚀 Downloading video from:", videoUrl);
    ffmpeg(videoUrl)
      .outputOptions("-c:v copy", "-c:a copy")
      .on("start", (cmd) => console.log("▶ FFmpeg command:", cmd))
      .on("end", () => {
        console.log("✅ Download complete");
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error("❌ Download error:", err.message);
        console.error("📄 FFmpeg stderr:\n", stderr);
        reject(err);
      })
      .save(outputPath);
  });
}

function processClips(inputPath, clips) {
  return Promise.all(
    clips.map((clip, index) => {
      return new Promise((resolve, reject) => {
        const outputFile = path.join(__dirname, `clip_${uuidv4()}_${index + 1}.mp4`);
        console.log(`✂️ Trimming clip ${index + 1}: ${clip.start} to ${clip.end}`);

        ffmpeg(inputPath)
          .setStartTime(clip.start)
          .setDuration(timeToSeconds(clip.end) - timeToSeconds(clip.start))
          .output(outputFile)
          .on("end", () => {
            console.log(`✅ Clip ${index + 1} saved to ${outputFile}`);
            resolve({ clip: index + 1, file: outputFile });
          })
          .on("error", (err, stdout, stderr) => {
            console.error(`❌ Error trimming clip ${index
