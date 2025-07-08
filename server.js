const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const trimRouter = require("./routes/trim");
const multiTrimRouter = require("./routes/multi-trim");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json({ limit: "200mb" }));

app.use("/trim", trimRouter);
app.use("/multi-trim", multiTrimRouter);

app.get("/", (req, res) => {
  res.send("Video Trim API is live!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
