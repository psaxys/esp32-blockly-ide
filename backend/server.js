const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const WORK_DIR = path.join(__dirname, 'build');
if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR);

app.post('/compile', (req, res) => {
    const code = req.body.code;
    const sketchFolder = path.join(WORK_DIR, 'sketch');
    const sketchPath = path.join(sketchFolder, 'sketch.ino');

    if (!fs.existsSync(sketchFolder)) fs.mkdirSync(sketchFolder, { recursive: true });
    fs.writeFileSync(sketchPath, code);

    // Команда компиляции для стандартной платы ESP32 Dev Module
    const cmd = `arduino-cli compile --fqbn esp32:esp32:esp32 --output-dir "${sketchFolder}" "${sketchFolder}"`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error("Compile Error:", stderr || stdout);
            return res.status(500).send(stderr || stdout);
        }
        
        const binPath = path.join(sketchFolder, 'sketch.ino.bin');
        if (fs.existsSync(binPath)) {
            res.download(binPath);
        } else {
            res.status(500).send("Binary not found");
        }
    });
});

app.listen(3000, () => console.log('Compiler Backend running on port 3000'));
