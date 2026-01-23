// Конфигурация
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : '/api',
    BLOCKLY_VERSION: '12.3.1',
    DEFAULT_BOARD: 'esp32dev',
    AUTO_SAVE_INTERVAL: 30000, // 30 секунд
    MAX_CONSOLE_LINES: 1000
};

// Глобальные переменные
let workspace = null;
let aceEditor = null;
let currentProject = null;
let socket = null;
let autoSaveTimer = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 ESP32 Blockly Programmer v2.0 загружается...');
        
        // Инициализация системы
        await initSystem();
        
        // Инициализация Blockly
        await initBlockly();
        
        // Инициализация редактора кода
        initCodeEditor();
        
        // Загрузка кастомных блоков
        await loadCustomBlocks();
        
        // Загрузка Toolbox
        await loadToolbox();
        
        // Проверка состояния сервера
        await checkServerStatus();
        
        // Загрузка списка проектов
        await loadProjectsCount();
        
        // Инициализация WebSocket
        initWebSocket();
        
        // Восстановление автосохранения
        restoreAutoSave();
        
        // Установка интервала автосохранения
        setupAutoSave();
        
        console.log('✅ Система успешно инициализирована');
        logToConsole('🚀 ESP32 Blockly Programmer v2.0 готов к работе!', 'success');
        logToConsole('💡 Перетащите блоки из панели слева для создания программы', 'info');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showNotification('Ошибка инициализации системы', 'error');
    }
});

// Инициализация системы
async function initSystem() {
    // Установка обработчиков событий
    document.getElementById('boardSelect').addEventListener('change', updateBoardInfo);
    document.getElementById('themeSelect').addEventListener('change', applyTheme);
    
    // Применение сохраненных настроек
    applySavedSettings();
    
    // Обновление информации о выбранной плате
    updateBoardInfo();
}

// Инициализация Blockly
async function initBlockly() {
    try {
        // Установка русского языка
        Blockly.setLocale(Blockly.Msg['ru']);
        
        // Создание рабочей области
        workspace = Blockly.inject('blocklyDiv', {
            toolbox: document.getElementById('toolbox'),
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            trashcan: true,
            scrollbars: true,
            sounds: true,
            renderer: 'zelos', // Современный рендерер
            theme: Blockly.Themes.Zelos, // Современная тема
            move: {
                scrollbars: true,
                drag: true,
                wheel: true
            }
        });
        
        // Обработчики событий рабочей области
        workspace.addChangeListener(updateBlockCount);
        workspace.addChangeListener(autoSaveWorkspace);
        
        // Инициализация счетчика блоков
        updateBlockCount();
        
        console.log('✅ Blockly инициализирован');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации Blockly:', error);
        throw error;
    }
}

// Инициализация редактора кода
function initCodeEditor() {
    try {
        aceEditor = ace.edit('codeEditor');
        aceEditor.setTheme('ace/theme/tomorrow_night_eighties');
        aceEditor.session.setMode('ace/mode/c_cpp');
        aceEditor.setOptions({
            fontSize: '14px',
            showPrintMargin: false,
            wrap: true,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });
        
        // Установка начального содержимого
        aceEditor.setValue(`// Добро пожаловать в ESP32 Blockly Programmer!
// Создайте программу с помощью блоков слева,
// затем нажмите "Генерировать код" чтобы увидеть результат здесь.

#include <Arduino.h>

void setup() {
    Serial.begin(115200);
    Serial.println("Hello from ESP32 Blockly!");
}

void loop() {
    // Ваш код здесь
    delay(1000);
}`);
        
        console.log('✅ Редактор кода инициализирован');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации редактора кода:', error);
    }
}

// Загрузка кастомных блоков
async function loadCustomBlocks() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/blocks`);
        if (!response.ok) throw new Error('Ошибка загрузки блоков');
        
        const data = await response.json();
        
        // Регистрация кастомных блоков
        data.blocks.forEach(block => {
            Blockly.Blocks[block.type] = {
                init: function() {
                    this.jsonInit(block);
                }
            };
        });
        
        // Регистрация генераторов кода
        registerCodeGenerators();
        
        // Обновление библиотеки блоков
        updateBlocksLibrary(data.blocks);
        
        console.log(`✅ Загружено ${data.blocks.length} кастомных блоков`);
        logToConsole(`📦 Загружено ${data.blocks.length} блоков ESP32`, 'success');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки кастомных блоков:', error);
        logToConsole('⚠️ Не удалось загрузить кастомные блоки', 'warning');
    }
}

// Загрузка Toolbox
async function loadToolbox() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/toolbox`);
        if (!response.ok) throw new Error('Ошибка загрузки toolbox');
        
        const toolbox = await response.json();
        
        // Обновление toolbox
        workspace.updateToolbox(toolbox);
        
        console.log('✅ Toolbox загружен');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки toolbox:', error);
        logToConsole('⚠️ Не удалось загрузить панель блоков', 'warning');
    }
}

// Регистрация генераторов кода
function registerCodeGenerators() {
    // Генератор для esp32_pin_mode
    Blockly.JavaScript['esp32_pin_mode'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const mode = block.getFieldValue('MODE');
        return `pinMode(${pin}, ${mode});\n`;
    };
    
    // Генератор для esp32_digital_write
    Blockly.JavaScript['esp32_digital_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state});\n`;
    };
    
    // Генератор для esp32_digital_read
    Blockly.JavaScript['esp32_digital_read'] = function(block) {
        const pin = block.getFieldValue('PIN');
        return [`digitalRead(${pin})`, Blockly.JavaScript.ORDER_ATOMIC];
    };
    
    // Генератор для esp32_delay
    Blockly.JavaScript['esp32_delay'] = function(block) {
        const time = block.getFieldValue('TIME');
        return `delay(${time});\n`;
    };
    
    // Генератор для esp32_wifi_connect
    Blockly.JavaScript['esp32_wifi_connect'] = function(block) {
        const ssid = block.getFieldValue('SSID');
        const password = block.getFieldValue('PASSWORD');
        return `WiFi.begin("${ssid}", "${password}");\n`;
    };
    
    // Генератор для esp32_serial_print
    Blockly.JavaScript['esp32_serial_print'] = function(block) {
        const text = Blockly.JavaScript.valueToCode(block, 'TEXT', 
            Blockly.JavaScript.ORDER_NONE) || '""';
        return `Serial.println(${text});\n`;
    };
    
    // Генератор для esp32_analog_read
    Blockly.JavaScript['esp32_analog_read'] = function(block) {
        const pin = block.getFieldValue('PIN');
        return [`analogRead(${pin})`, Blockly.JavaScript.ORDER_ATOMIC];
    };
    
    // Генератор для esp32_analog_write
    Blockly.JavaScript['esp32_analog_write'] = function(block) {
        const pin = block.getFieldValue('PIN');
        const value = Blockly.JavaScript.valueToCode(block, 'VALUE', 
            Blockly.JavaScript.ORDER_NONE) || '0';
        return `analogWrite(${pin}, ${value});\n`;
    };
    
    // Генератор для esp32_millis
    Blockly.JavaScript['esp32_millis'] = function() {
        return ['millis()', Blockly.JavaScript.ORDER_ATOMIC];
    };
    
    // Генератор для esp32_wifi_status
    Blockly.JavaScript['esp32_wifi_status'] = function() {
        return ['WiFi.status() == WL_CONNECTED', Blockly.JavaScript.ORDER_ATOMIC];
    };
}

// Генерация кода
async function generateCode() {
    try {
        updateWorkspaceStatus('Генерация кода...', 'busy');
        
        // Генерация XML из рабочей области
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        
        // Отправка на сервер для генерации кода
        const response = await fetch(`${CONFIG.API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                xml: xmlText,
                board: document.getElementById('boardSelect').value
            })
        });
        
        if (!response.ok) throw new Error('Ошибка генерации кода');
        
        const result = await response.json();
        
        if (result.success) {
            // Отображение сгенерированного кода
            aceEditor.setValue(result.code);
            
            // Переключение на вкладку кода
            showTab('code');
            
            // Обновление статуса
            updateWorkspaceStatus('Код сгенерирован', 'idle');
            
            // Логирование
            logToConsole('✅ Код успешно сгенерирован', 'success');
            logToConsole(`📁 Файл: ${result.filename}`, 'info');
            
            showNotification('Код успешно сгенерирован!', 'success');
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('❌ Ошибка генерации кода:', error);
        logToConsole(`❌ Ошибка генерации кода: ${error.message}`, 'error');
        updateWorkspaceStatus('Ошибка генерации', 'error');
        showNotification('Ошибка генерации кода', 'error');
    }
}

// Компиляция кода
async function compileCode() {
    try {
        const code = aceEditor.getValue();
        
        if (!code || code.trim().length < 10) {
            showNotification('Сначала сгенерируйте код!', 'warning');
            return;
        }
        
        updateWorkspaceStatus('Компиляция...', 'busy');
        
        const board = document.getElementById('boardSelect').value;
        
        logToConsole(`🔄 Начата компиляция для платы: ${board}`, 'info');
        
        const response = await fetch(`${CONFIG.API_URL}/compile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                board: board
            })
        });
        
        if (!response.ok) throw new Error('Ошибка компиляции');
        
        const result = await response.json();
        
        if (result.success) {
            logToConsole('✅ Компиляция успешно завершена', 'success');
            logToConsole(`📦 Размер прошивки: ${result.binary_size} байт`, 'info');
            logToConsole(`💾 Оценка памяти: ${result.estimated_flash}`, 'info');
            
            updateWorkspaceStatus('Компиляция успешна', 'idle');
            showNotification('Компиляция успешно завершена!', 'success');
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка компиляции');
        }
        
    } catch (error) {
        console.error('❌ Ошибка компиляции:', error);
        logToConsole(`❌ Ошибка компиляции: ${error.message}`, 'error');
        updateWorkspaceStatus('Ошибка компиляции', 'error');
        showNotification('Ошибка компиляции', 'error');
    }
}

// Загрузка на ESP32
async function uploadToESP32() {
    try {
        const code = aceEditor.getValue();
        
        if (!code || code.trim().length < 10) {
            showNotification('Сначала сгенерируйте и скомпилируйте код!', 'warning');
            return;
        }
        
        updateWorkspaceStatus('Загрузка...', 'busy');
        
        // Запрос порта у пользователя
        const port = prompt('Введите порт ESP32 (например: COM3, /dev/ttyUSB0):', '/dev/ttyUSB0');
        if (!port) return;
        
        const baudrate = prompt('Введите скорость загрузки (по умолчанию 921600):', '921600');
        
        logToConsole(`🔄 Начата загрузка на ESP32 через порт: ${port}`, 'info');
        
        const response = await fetch(`${CONFIG.API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                port: port,
                baudrate: parseInt(baudrate) || 921600
            })
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const result = await response.json();
        
        if (result.success) {
            // Отображение шагов загрузки
            result.steps.forEach(step => {
                logToConsole(`📤 ${step}`, 'info');
            });
            
            logToConsole('✅ Прошивка успешно загружена на ESP32!', 'success');
            updateWorkspaceStatus('Загрузка успешна', 'idle');
            showNotification('Прошивка успешно загружена!', 'success');
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка загрузки');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        logToConsole(`❌ Ошибка загрузки: ${error.message}`, 'error');
        updateWorkspaceStatus('Ошибка загрузки', 'error');
        showNotification('Ошибка загрузки прошивки', 'error');
    }
}

// Сохранение проекта
async function saveProject() {
    try {
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        const code = aceEditor.getValue();
        
        // Показ модального окна
        document.getElementById('saveModal').style.display = 'flex';
        
        // Фокус на поле имени
        setTimeout(() => {
            document.getElementById('projectName').focus();
        }, 100);
        
    } catch (error) {
        console.error('❌ Ошибка подготовки сохранения:', error);
        showNotification('Ошибка подготовки сохранения', 'error');
    }
}

// Подтверждение сохранения проекта
async function saveProjectConfirm() {
    try {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        
        if (!name) {
            showNotification('Введите имя проекта', 'warning');
            return;
        }
        
        const xml = Blockly.Xml.workspaceToDom(workspace);
        const xmlText = Blockly.Xml.domToText(xml);
        const code = aceEditor.getValue();
        
        updateWorkspaceStatus('Сохранение...', 'busy');
        
        const response = await fetch(`${CONFIG.API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                description: description,
                xml: xmlText,
                code: code,
                blocks: getWorkspaceBlocksInfo()
            })
        });
        
        if (!response.ok) throw new Error('Ошибка сохранения');
        
        const result = await response.json();
        
        if (result.success) {
            currentProject = result.project;
            closeModal('saveModal');
            
            logToConsole(`💾 Проект "${name}" сохранен`, 'success');
            updateWorkspaceStatus('Проект сохранен', 'idle');
            showNotification('Проект успешно сохранен!', 'success');
            
            // Обновление счетчика проектов
            loadProjectsCount();
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('❌ Ошибка сохранения проекта:', error);
        showNotification(`Ошибка сохранения: ${error.message}`, 'error');
        updateWorkspaceStatus('Ошибка сохранения', 'error');
    }
}

// Загрузка проекта
async function loadProjectModal() {
    try {
        updateWorkspaceStatus('Загрузка списка...', 'busy');
        
        const response = await fetch(`${CONFIG.API_URL}/projects`);
        if (!response.ok) throw new Error('Ошибка загрузки списка проектов');
        
        const result = await response.json();
        
        if (result.success) {
            const projectsList = document.getElementById('projectsList');
            projectsList.innerHTML = '';
            
            if (result.projects.length === 0) {
                projectsList.innerHTML = '<p>Нет сохраненных проектов</p>';
            } else {
                result.projects.forEach(project => {
                    const projectElement = document.createElement('div');
                    projectElement.className = 'project-item';
                    projectElement.innerHTML = `
                        <div class="project-info">
                            <strong>${project.name}</strong>
                            <span>${project.description || 'Без описания'}</span>
                        </div>
                        <button class="btn btn-sm" onclick="loadProject('${project.name}')">
                            <i class="fas fa-folder-open"></i> Открыть
                        </button>
                    `;
                    projectsList.appendChild(projectElement);
                });
            }
            
            document.getElementById('loadModal').style.display = 'flex';
            updateWorkspaceStatus('Готов', 'idle');
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки списка проектов:', error);
        showNotification('Ошибка загрузки списка проектов', 'error');
        updateWorkspaceStatus('Ошибка загрузки', 'error');
    }
}

// Загрузка конкретного проекта
async function loadProject(projectName) {
    try {
        updateWorkspaceStatus('Загрузка проекта...', 'busy');
        
        const response = await fetch(`${CONFIG.API_URL}/projects/${encodeURIComponent(projectName)}`);
        if (!response.ok) throw new Error('Ошибка загрузки проекта');
        
        const result = await response.json();
        
        if (result.success) {
            // Загрузка XML
            if (result.files['project.xml']) {
                const xml = Blockly.Xml.textToDom(result.files['project.xml']);
                workspace.clear();
                Blockly.Xml.domToWorkspace(xml, workspace);
            }
            
            // Загрузка кода
            if (result.files['sketch.ino']) {
                aceEditor.setValue(result.files['sketch.ino']);
            }
            
            currentProject = result.metadata;
            closeModal('loadModal');
            
            logToConsole(`📂 Проект "${projectName}" загружен`, 'success');
            updateWorkspaceStatus('Проект загружен', 'idle');
            showNotification('Проект успешно загружен!', 'success');
            
            // Переключение на вкладку кода
            showTab('code');
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки проекта:', error);
        showNotification('Ошибка загрузки проекта', 'error');
        updateWorkspaceStatus('Ошибка загрузки', 'error');
    }
}

// Вспомогательные функции

function updateBlockCount() {
    const blockCount = workspace.getAllBlocks(false).length;
    document.getElementById('blockCount').textContent = `${blockCount} блоков`;
}

function updateWorkspaceStatus(message, status) {
    const statusElement = document.getElementById('workspaceStatus');
    statusElement.textContent = message;
    statusElement.className = `status-${status}`;
}

function logToConsole(message, type = 'info') {
    const consoleOutput = document.getElementById('consoleOutput');
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    const line = `<div class="console-line console-${type}">
        <span class="console-time">[${timestamp}]</span>
        <span class="console-icon">${icon}</span>
        <span class="console-message">${message}</span>
    </div>`;
    
    consoleOutput.innerHTML += line;
    
    // Ограничение количества строк
    const lines = consoleOutput.querySelectorAll('.console-line');
    if (lines.length > CONFIG.MAX_CONSOLE_LINES) {
        lines[0].remove();
    }
    
    // Автопрокрутка
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
    logToConsole('Консоль очищена', 'info');
}

function showTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Снять активность со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Активировать кнопку
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes(tabName)) {
            btn.classList.add('active');
        }
    });
    
    // Особые действия для вкладок
    if (tabName === 'code') {
        setTimeout(() => aceEditor.resize(), 100);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function clearWorkspace() {
    if (confirm('Вы уверены, что хотите очистить рабочую область?')) {
        workspace.clear();
        logToConsole('Рабочая область очищена', 'info');
    }
}

function copyCode() {
    const code = aceEditor.getValue();
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Код скопирован в буфер обмена!', 'success');
    }).catch(err => {
        showNotification('Ошибка копирования кода', 'error');
    });
}

function downloadCode() {
    const code = aceEditor.getValue();
    const filename = `esp32_sketch_${Date.now()}.ino`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logToConsole(`📥 Файл "${filename}" скачан`, 'success');
}

function updateBoardInfo() {
    const boardSelect = document.getElementById('boardSelect');
    const selectedBoard = boardSelect.options[boardSelect.selectedIndex].text;
    document.getElementById('selectedBoard').textContent = selectedBoard;
}

function changeLanguage(lang) {
    Blockly.setLocale(Blockly.Msg[lang]);
    localStorage.setItem('esp32_blockly_language', lang);
    showNotification(`Язык изменен на ${lang === 'ru' ? 'русский' : 'английский'}`, 'success');
}

function changeTheme(theme) {
    const body = document.body;
    
    // Удаление предыдущих тем
    body.classList.remove('dark-theme', 'highcontrast-theme');
    
    // Применение выбранной темы
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else if (theme === 'highcontrast') {
        body.classList.add('highcontrast-theme');
    }
    
    localStorage.setItem('esp32_blockly_theme', theme);
    showNotification(`Тема изменена на ${theme}`, 'success');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Ошибка перехода в полный экран: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

function applySavedSettings() {
    // Язык
    const savedLang = localStorage.getItem('esp32_blockly_language') || 'ru';
    document.getElementById('languageSelect').value = savedLang;
    changeLanguage(savedLang);
    
    // Тема
    const savedTheme = localStorage.getItem('esp32_blockly_theme') || 'default';
    document.getElementById('themeSelect').value = savedTheme;
    changeTheme(savedTheme);
    
    // Плата
    const savedBoard = localStorage.getItem('esp32_blockly_board') || CONFIG.DEFAULT_BOARD;
    document.getElementById('boardSelect').value = savedBoard;
}

function updateBlocksLibrary(blocks) {
    const blocksLibrary = document.querySelector('.blocks-library');
    
    // Группировка блоков по категориям
    const categories = {};
    
    blocks.forEach(block => {
        const category = block.colour ? getCategoryByColor(block.colour) : 'Другие';
        
        if (!categories[category]) {
            categories[category] = [];
        }
        
        categories[category].push(block);
    });
    
    // Создание HTML для библиотеки
    let html = '';
    
    for (const [category, blocks] of Object.entries(categories)) {
        html += `
            <div class="block-category">
                <h5><i class="fas fa-cube"></i> ${category}</h5>
                <div class="block-list">
        `;
        
        blocks.forEach(block => {
            html += `
                <div class="block-item" title="${block.tooltip || block.type}">
                    <div class="block-icon" style="background-color: #${block.colour.toString(16)}"></div>
                    <span>${block.message0.replace(/%\d+/g, '...')}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    blocksLibrary.innerHTML = html;
}

function getCategoryByColor(color) {
    switch(color) {
        case 230: return 'GPIO';
        case 120: return 'Время';
        case 160: return 'Serial';
        case 260: return 'WiFi';
        default: return 'Другие';
    }
}

function getWorkspaceBlocksInfo() {
    const blocks = workspace.getAllBlocks(false);
    return blocks.map(block => ({
        type: block.type,
        id: block.id,
        x: block.getRelativeToSurfaceXY().x,
        y: block.getRelativeToSurfaceXY().y
    }));
}

function autoSaveWorkspace() {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    localStorage.setItem('esp32_blockly_autosave', xmlText);
}

function restoreAutoSave() {
    const saved = localStorage.getItem('esp32_blockly_autosave');
    if (saved) {
        try {
            const xml = Blockly.Xml.textToDom(saved);
            workspace.clear();
            Blockly.Xml.domToWorkspace(xml, workspace);
            logToConsole('📁 Автосохранение восстановлено', 'info');
        } catch (error) {
            console.error('❌ Ошибка восстановления автосохранения:', error);
        }
    }
}

function setupAutoSave() {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    
    autoSaveTimer = setInterval(() => {
        autoSaveWorkspace();
        logToConsole('💾 Автосохранение выполнено', 'info');
    }, CONFIG.AUTO_SAVE_INTERVAL);
}

function initWebSocket() {
    try {
        socket = io();
        
        socket.on('connect', () => {
            logToConsole('🔗 Подключено к серверу WebSocket', 'success');
        });
        
        socket.on('compile_update', (data) => {
            logToConsole(`🔄 Компиляция: ${data.status} (${data.progress}%)`, 'info');
        });
        
        socket.on('connected', (data) => {
            console.log('WebSocket connected:', data);
        });
        
    } catch (error) {
        console.error('❌ Ошибка инициализации WebSocket:', error);
    }
}

async function checkServerStatus() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/health`);
        const data = await response.json();
        
        document.getElementById('apiStatus').textContent = 'Работает';
        document.getElementById('apiStatus').style.color = 'var(--success-color)';
        
        logToConsole(`🌐 Сервер: ${data.status} (v${data.version})`, 'success');
        
    } catch (error) {
        document.getElementById('apiStatus').textContent = 'Недоступен';
        document.getElementById('apiStatus').style.color = 'var(--danger-color)';
        
        logToConsole('❌ Сервер API недоступен', 'error');
    }
}

async function loadProjectsCount() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/projects`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('projectsCount').textContent = `${data.count} проектов`;
        }
    } catch (error) {
        document.getElementById('projectsCount').textContent = 'Недоступно';
    }
}

function showNotification(message, type = 'info') {
    // Удаление существующих уведомлений
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Создание нового уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Экспорт глобальных функций
window.generateCode = generateCode;
window.compileCode = compileCode;
window.uploadToESP32 = uploadToESP32;
window.saveProject = saveProject;
window.saveProjectConfirm = saveProjectConfirm;
window.loadProjectModal = loadProjectModal;
window.loadProject = loadProject;
window.showTab = showTab;
window.closeModal = closeModal;
window.clearWorkspace = clearWorkspace;
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.clearConsole = clearConsole;
window.changeLanguage = changeLanguage;
window.changeTheme = changeTheme;
window.toggleFullscreen = toggleFullscreen;

// Дополнительные утилиты
function showAbout() {
    alert(`
ESP32 Blockly Programmer v2.0

Визуальная среда разработки для ESP32
на основе Blockly 12.3.1

Возможности:
- Визуальное программирование блоков
- Генерация Arduino кода
- Компиляция и загрузка прошивки
- Сохранение и загрузка проектов
- Поддержка GPIO, WiFi, Serial

Сделано с ❤️ для сообщества ESP32
    `);
}

function showDocumentation() {
    window.open('https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html', '_blank');
}

function showExamples() {
    logToConsole('📚 Примеры проектов:', 'info');
    logToConsole('  1. Мигающий светодиод - Используйте блоки GPIO и задержки', 'info');
    logToConsole('  2. WiFi подключение - Используйте блок WiFi Connect', 'info');
    logToConsole('  3. Аналоговые датчики - Используйте блоки analogRead', 'info');
}
