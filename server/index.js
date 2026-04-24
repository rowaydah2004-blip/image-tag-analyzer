const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.static(path.join(__dirname, "../client")));
app.use(cors());

const upload = multer({ dest: path.join(__dirname, "../uploads") });

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;
  const scriptPath = path.join(__dirname, "../analyze.py");

  exec(`py -3.11 "${scriptPath}" "${filePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      console.error(stderr);
      return res.status(500).json({ error: "Error analyzing image" });
    }

    const tags = stdout
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [label, score] = line.split("|");
    return {
      label: label,
      score: Number(score)
    };
  });

fs.unlink(filePath, (unlinkError) => {
  if (unlinkError) {
    console.error("Error deleting uploaded file:", unlinkError);
  }
});

res.json({ tags });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
