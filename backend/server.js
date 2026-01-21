const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const BUILD_DIR = path.join(__dirname, 'build_cache');
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR);

app.post('/compile', (req, res) => {
    const code = req.body.code;
    if (!code) return res.status(400).send("No code provided");

    const sketchName = 'Sketch';
    const sketchDir = path.join(BUILD_DIR, sketchName);
    const inoPath = path.join(sketchDir, `${sketchName}.ino`);

    // 1. Создаем структуру папок для Arduino (Sketch/Sketch.ino)
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir);
    fs.writeFileSync(inoPath, code);

    console.log("Start compiling...");
    
    // 2. Запускаем arduino-cli
    // fqbn esp32:esp32:esp32 - стандартная плата ESP32 Dev Module
    const cmd = `arduino-cli compile --fqbn esp32:esp32:esp32 --output-dir "${sketchDir}" "${sketchDir}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Compilation error: ${stderr}`);
            return res.status(500).send(stderr || stdout); // Возвращаем логи ошибки
        }

        console.log("Compilation success!");
        
        // 3. Отдаем .bin файл
        const binPath = path.join(sketchDir, `${sketchName}.ino.bin`);
        if (fs.existsSync(binPath)) {
            res.download(binPath, 'firmware.bin');
        } else {
            res.status(500).send("Binary file not found after compilation");
        }
    });
});

app.listen(3000, () => console.log('Compiler server running on port 3000'));
