const express = require('express');
const cors = require('cors');
const https = require('https');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// API для компиляции
app.post('/api/compile', async (req, res) => {
    try {
        const { code, projectId, options = {} } = req.body;
        const workspacePath = path.join(__dirname, '../workspaces', projectId || uuidv4());
        
        console.log(`Компиляция проекта: ${workspacePath}`);
        
        // Создаем проект
        await createPlatformIOProject(workspacePath, code, options);
        
        // Компилируем
        const { binaryPath, size } = await compileProject(workspacePath);
        
        // Читаем бинарный файл
        const binary = await fs.readFile(binaryPath);
        
        // Сохраняем информацию о проекте
        await saveProjectInfo(workspacePath, {
            code,
            compiledAt: new Date().toISOString(),
            size,
            options
        });
        
        res.json({
            success: true,
            binary: binary.toString('base64'),
            size,
            projectId: path.basename(workspacePath),
            message: `Прошивка успешно скомпилирована (${size} байт)`
        });
    } catch (error) {
        console.error('Ошибка компиляции:', error);
        const message = String(error.message || 'Неизвестная ошибка');
        res.status(500).json({ 
            success: false, 
            error: message,
            details: error.stderr || ''
        });
    }
});


// API для сохранения проекта без компиляции
app.post('/api/project', async (req, res) => {
    try {
        const { code, blocklyState, name, projectId, options = {} } = req.body;
        const id = projectId || uuidv4();
        const workspacePath = path.join(__dirname, '../workspaces', id);

        await fs.mkdir(path.join(workspacePath, 'src'), { recursive: true });
        await fs.writeFile(path.join(workspacePath, 'src', 'main.cpp'), code || '// empty');

        if (blocklyState) {
            await fs.writeFile(path.join(workspacePath, 'blockly-state.json'), JSON.stringify(blocklyState, null, 2));
        }

        const info = {
            name: name || `Проект ${id.substring(0, 8)}`,
            savedAt: new Date().toISOString(),
            size: (code || '').length,
            options
        };
        await saveProjectInfo(workspacePath, info);

        res.json({ success: true, projectId: id, message: 'Проект сохранен' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API для получения информации о проекте
app.get('/api/project/:id', async (req, res) => {
    try {
        const projectPath = path.join(__dirname, '../workspaces', req.params.id);
        const infoPath = path.join(projectPath, 'project-info.json');
        
        const info = JSON.parse(await fs.readFile(infoPath, 'utf8'));
        const code = await fs.readFile(path.join(projectPath, 'src', 'main.cpp'), 'utf8');
        let blocklyState = null;
        try {
            blocklyState = JSON.parse(await fs.readFile(path.join(projectPath, 'blockly-state.json'), 'utf8'));
        } catch (e) {}
        
        res.json({
            success: true,
            project: {
                id: req.params.id,
                code,
                info,
                blocklyState
            }
        });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Проект не найден' });
    }
});


// API для удаления проекта
app.delete('/api/project/:id', async (req, res) => {
    try {
        const projectPath = path.join(__dirname, '../workspaces', req.params.id);
        await fs.rm(projectPath, { recursive: true, force: true });
        res.json({ success: true, message: 'Проект удален' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API для списка проектов
app.get('/api/projects', async (req, res) => {
    try {
        const workspacesPath = path.join(__dirname, '../workspaces');
        const items = await fs.readdir(workspacesPath, { withFileTypes: true });
        
        const projects = [];
        for (const item of items) {
            if (item.isDirectory()) {
                const infoPath = path.join(workspacesPath, item.name, 'project-info.json');
                try {
                    const info = JSON.parse(await fs.readFile(infoPath, 'utf8'));
                    projects.push({
                        id: item.name,
                        name: info.name || `Проект ${item.name.substring(0, 8)}` ,
                        compiledAt: info.compiledAt || info.savedAt,
                        size: info.size
                    });
                } catch (e) {
                    // Пропускаем если нет информации
                }
            }
        }
        
        res.json({ success: true, projects });
    } catch (error) {
        res.json({ success: true, projects: [] });
    }
});

async function createPlatformIOProject(workspacePath, code, options) {
    // Создаем директории
    await fs.mkdir(path.join(workspacePath, 'src'), { recursive: true });
    await fs.mkdir(path.join(workspacePath, 'include'), { recursive: true });
    await fs.mkdir(path.join(workspacePath, 'lib'), { recursive: true });
    
    // Основной файл
    const sourceCode = buildSourceCode(workspacePath, code, options);
    await fs.writeFile(
        path.join(workspacePath, 'src', 'main.cpp'),
        sourceCode
    );
    
    // PlatformIO конфигурация
    const selectedLibraries = Array.from(new Set(options.libraries || []));
    const libsSection = selectedLibraries.length
        ? `lib_deps =\n    ${selectedLibraries.join('\n    ')}`
        : 'lib_deps =';
    const platformioConfig = `
[env:esp32dev]
platform = espressif32@6.9.0
board = ${options.board || "esp32dev"}
framework = arduino
monitor_speed = 115200
upload_speed = 921600
build_flags = 
    -Wno-unused-variable
    -Wno-unused-function
${libsSection}
upload_port = /dev/ttyUSB0
`;

    await fs.writeFile(
        path.join(workspacePath, 'platformio.ini'),
        platformioConfig
    );
    
    // Дополнительные настройки
    if (options.extraFiles) {
        for (const [filename, content] of Object.entries(options.extraFiles)) {
            await fs.writeFile(
                path.join(workspacePath, filename),
                content
            );
        }
    }
}


function buildSourceCode(workspacePath, code, options) {
    const hasSetupLoop = /void\s+setup\s*\(/.test(code) && /void\s+loop\s*\(/.test(code);
    if (hasSetupLoop) {
        return `// ESP32 Blockly Generated Code
// Project ID: ${path.basename(workspacePath)}
// Generated: ${new Date().toISOString()}

${code}
`;
    }

    return `// ESP32 Blockly Generated Code
// Project ID: ${path.basename(workspacePath)}
// Generated: ${new Date().toISOString()}

#include <Arduino.h>

${code}

void setup() {
    Serial.begin(115200);
}

void loop() {
    ${options.delay ? `delay(${options.delay});` : 'delay(10);'}
}`;
}

async function compileProject(workspacePath) {
    try {
        console.log(`Запуск компиляции в ${workspacePath}`);

        try {
            await execPromise('command -v pio');
        } catch (_) {
            throw new Error('PlatformIO (pio) не найден в web-контейнере. Пересоберите контейнер после обновления Dockerfile: docker-compose build web && docker-compose up -d web');
        }
        
        // Запускаем компиляцию через PlatformIO
        const { stdout, stderr } = await execPromise(
            `cd ${workspacePath} && pio run`,
            { timeout: 120000 } // 2 минуты таймаут
        );
        
        const binaryPath = path.join(
            workspacePath, 
            '.pio/build/esp32dev/firmware.bin'
        );
        
        // Проверяем размер файла
        const stats = await fs.stat(binaryPath);
        
        return {
            binaryPath,
            size: stats.size,
            stdout: stdout.substring(0, 1000), // Ограничиваем вывод
            stderr: stderr ? stderr.substring(0, 1000) : ''
        };
    } catch (error) {
        // Пытаемся получить больше информации об ошибке
        const errorLog = path.join(workspacePath, 'compile-error.log');
        await fs.writeFile(errorLog, `STDOUT: ${error.stdout || ''}

STDERR: ${error.stderr || ''}`);
        
        const stderr = error.stderr ? `
${error.stderr}` : '';
        throw new Error(`Ошибка компиляции: ${error.message}${stderr}`);
    }
}

async function saveProjectInfo(workspacePath, info) {
    await fs.writeFile(
        path.join(workspacePath, 'project-info.json'),
        JSON.stringify(info, null, 2)
    );
}

app.listen(PORT, () => {
    console.log(`🚀 ESP32 Blockly Constructor (HTTP) запущен на порту ${PORT}`);
    console.log(`📁 Рабочие директории: ${path.join(__dirname, '../workspaces')}`);
});

if (process.env.USE_HTTPS === 'true') {
    try {
        const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '../certs/server.crt');
        const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '../certs/server.key');
        const options = {
            key: fsSync.readFileSync(keyPath),
            cert: fsSync.readFileSync(certPath)
        };

        https.createServer(options, app).listen(HTTPS_PORT, () => {
            console.log(`🔒 HTTPS запущен на порту ${HTTPS_PORT}`);
        });
    } catch (error) {
        console.error('Не удалось запустить HTTPS:', error.message);
    }
}
