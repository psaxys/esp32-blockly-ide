const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/compile', (req, res) => {
    const sketchDir = `./temp/sketch_${Date.now()}`;
    fs.mkdirSync(sketchDir, { recursive: true });
    fs.writeFileSync(`${sketchDir}/sketch.ino`, req.body.code);

    try {
        // Компиляция в один файл .merged.bin
        execSync(`arduino-cli compile --fqbn esp32:esp32:esp32dev --output-dir ${sketchDir}/out ${sketchDir}`);
        const bin = fs.readFileSync(`${sketchDir}/out/sketch.ino.merged.bin`);
        res.send(bin);
    } catch (e) {
        res.status(500).send(e.stderr.toString());
    }
});

app.listen(3000, '0.0.0.0');
