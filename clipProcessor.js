const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { v4: uuidv4 } = require("uuid");

function downloadVideo(videoUrl, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = videoUrl.startsWith("https") ? https : http;
    const file = fs.createWriteStream(outputPath);
    protocol.get(videoUrl, response => {
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      fs.unlink(outputPath, () => reject(err));
    });
  });
}

function trimClip(inputPath, start, end, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(timeDiffInSeconds(start, end))
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", err => reject(err))
      .run();
  });
}

function timeDiffInSeconds(start, end) {
  const [sh, sm, ss] = start.split(":").map(Number);
  const [eh, em, es] = end.split(":").map(Number);
  return (eh * 3600 + em * 60 + es) - (sh * 3600 + sm * 60 + ss);
}

async function processClips(videoPath, clips) {
  const results = [];

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const outputPath = path.join(__dirname, `clip_${i + 1}_${uuidv4()}.mp4`);
    await trimClip(videoPath, clip.start, clip.end, outputPath);
    const data = fs.readFileSync(outputPath);
    const base64 = data.toString("base64");
    results.push({ filename: path.basename(outputPath), base64 });
    fs.unlinkSync(outputPath);
  }

  return results;
}

module.exports = { downloadVideo, processClips };
