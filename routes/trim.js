const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  res.json({ message: "Basic trim route placeholder" });
});

module.exports = router;
