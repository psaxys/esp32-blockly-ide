// Конфигурация Blockly с улучшенным генератором кода
document.addEventListener('DOMContentLoaded', function() {
    const blocklyDiv = document.getElementById('blocklyDiv');
    
    // Настройка рабочей области
    window.workspace = Blockly.inject(blocklyDiv, {
        toolbox: {
            kind: 'categoryToolbox',
            contents: [
                {
                    kind: 'category',
                    name: 'Логика',
                    colour: '#5C81A6',
                    contents: [
                        { kind: 'block', type: 'controls_if' },
                        { kind: 'block', type: 'logic_compare' },
                        { kind: 'block', type: 'logic_operation' },
                        { kind: 'block', type: 'logic_boolean' },
                        { kind: 'block', type: 'logic_negate' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Циклы',
                    colour: '#5CA65C',
                    contents: [
                        { kind: 'block', type: 'controls_whileUntil' },
                        { kind: 'block', type: 'controls_for' },
                        { kind: 'block', type: 'controls_repeat' },
                        { kind: 'block', type: 'controls_flow_statements' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Математика',
                    colour: '#A65C81',
                    contents: [
                        { kind: 'block', type: 'math_number' },
                        { kind: 'block', type: 'math_arithmetic' },
                        { kind: 'block', type: 'math_single' },
                        { kind: 'block', type: 'math_trig' },
                        { kind: 'block', type: 'math_constant' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Текст',
                    colour: '#A6A65C',
                    contents: [
                        { kind: 'block', type: 'text' },
                        { kind: 'block', type: 'text_join' },
                        { kind: 'block', type: 'text_print' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Переменные',
                    colour: '#A65CA6',
                    custom: 'VARIABLE',
                    colour: '#ff8c1a'
                },
                {
                    kind: 'category',
                    name: 'Функции',
                    colour: '#5CA6A6',
                    custom: 'PROCEDURE',
                    colour: '#995ba5'
                },
                {
                    kind: 'category',
                    name: 'ESP32 GPIO',
                    colour: '#4A90E2',
                    contents: [
                        {
                            kind: 'block',
                            blockxml: `
                                <block type="pin_mode">
                                    <field name="PIN">2</field>
                                    <field name="MODE">OUTPUT</field>
                                </block>`
                        },
                        {
                            kind: 'block',
                            blockxml: `
                                <block type="digital_write">
                                    <field name="PIN">2</field>
                                    <field name="STATE">HIGH</field>
                                </block>`
                        },
                        {
                            kind: 'block',
                            blockxml: `<block type="digital_read">
                                <field name="PIN">2</field>
                            </block>`
                        },
                        {
                            kind: 'block',
                            blockxml: `<block type="analog_read">
                                <field name="PIN">32</field>
                            </block>`
                        },
                        {
                            kind: 'block',
                            blockxml: `
                                <block type="pwm_write">
                                    <field name="PIN">2</field>
                                    <value name="VALUE">
                                        <shadow type="math_number">
                                            <field name="NUM">128</field>
                                        </shadow>
                                    </value>
                                </block>`
                        }
                    ]
                },
                {
                    kind: 'category',
                    name: 'ESP32 WiFi',
                    colour: '#7B68EE',
                    contents: [
                        {
                            kind: 'block',
                            blockxml: `
                                <block type="wifi_begin">
                                    <value name="SSID">
                                        <shadow type="text">
                                            <field name="TEXT">MyWiFi</field>
                                        </shadow>
                                    </value>
                                    <value name="PASSWORD">
                                        <shadow type="text">
                                            <field name="TEXT">password123</field>
                                        </shadow>
                                    </value>
                                </block>`
                        },
                        { kind: 'block', type: 'wifi_status' },
                        { kind: 'block', type: 'server_begin' },
                        { kind: 'block', type: 'client_available' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Время',
                    colour: '#20B2AA',
                    contents: [
                        { kind: 'block', type: 'delay_block' },
                        { kind: 'block', type: 'millis_block' }
                    ]
                },
                {
                    kind: 'category',
                    name: 'Serial',
                    colour: '#FF6347',
                    contents: [
                        { kind: 'block', type: 'serial_begin' },
                        { kind: 'block', type: 'serial_print' },
                        { kind: 'block', type: 'serial_println' },
                        { kind: 'block', type: 'serial_available' },
                        { kind: 'block', type: 'serial_read' }
                    ]
                }
            ]
        },
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
        horizontalLayout: false,
        toolboxPosition: 'start',
        css: true,
        media: 'https://unpkg.com/blockly/media/',
        rtl: false,
        scrollbars: true,
        sounds: true,
        oneBasedIndex: true,
        collapse: true,
        comments: true,
        disable: true,
        maxBlocks: Infinity,
        maxInstances: {
            'math_number': Infinity,
            'text': Infinity
        }
    });

    // Создаем кастомные блоки для ESP32
    createCustomBlocks();
    
    // Обновляем код при изменении блоков
    window.workspace.addChangeListener(function(event) {
        if (!event.isUiEvent) {
            setTimeout(generateCode, 100);
        }
    });
});

// Создание кастомных блоков
function createCustomBlocks() {
    // Блок для настройки пина
    Blockly.Blocks['pin_mode'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Настроить пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN")
                .appendField("как")
                .appendField(new Blockly.FieldDropdown([
                    ["Выход (OUTPUT)", "OUTPUT"],
                    ["Вход (INPUT)", "INPUT"],
                    ["Вход с подтяжкой (INPUT_PULLUP)", "INPUT_PULLUP"],
                    ["Вход с подтяжкой вниз (INPUT_PULLDOWN)", "INPUT_PULLDOWN"]
                ]), "MODE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Настройка режима работы пина ESP32");
            this.setHelpUrl("");
        }
    };

    // Блок для записи в цифровой пин
    Blockly.Blocks['digital_write'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Установить пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN")
                .appendField("в")
                .appendField(new Blockly.FieldDropdown([
                    ["HIGH (ВКЛ)", "HIGH"],
                    ["LOW (ВЫКЛ)", "LOW"]
                ]), "STATE");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Установка HIGH или LOW на цифровом пине");
            this.setHelpUrl("");
        }
    };

    // Блок для чтения цифрового пина
    Blockly.Blocks['digital_read'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Прочитать пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN");
            this.setOutput(true, 'Boolean');
            this.setColour(230);
            this.setTooltip("Чтение состояния цифрового пина (HIGH/LOW)");
            this.setHelpUrl("");
        }
    };

    // Блок для чтения аналогового пина
    Blockly.Blocks['analog_read'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Аналоговое чтение пина")
                .appendField(new Blockly.FieldDropdown([
                    ["32", "32"], ["33", "33"], ["34", "34"], ["35", "35"],
                    ["36", "36"], ["39", "39"]
                ]), "PIN");
            this.setOutput(true, 'Number');
            this.setColour(230);
            this.setTooltip("Чтение аналогового значения (0-4095)");
            this.setHelpUrl("");
        }
    };

    // Блок для PWM записи
    Blockly.Blocks['pwm_write'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("PWM на пин")
                .appendField(new Blockly.FieldDropdown([
                    ["2", "2"], ["4", "4"], ["5", "5"], ["12", "12"],
                    ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"],
                    ["17", "17"], ["18", "18"], ["19", "19"], ["21", "21"],
                    ["22", "22"], ["23", "23"], ["25", "25"], ["26", "26"],
                    ["27", "27"], ["32", "32"], ["33", "33"]
                ]), "PIN")
                .appendField("значение");
            this.appendValueInput("VALUE")
                .setCheck("Number");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setTooltip("Установка PWM значения (0-255)");
            this.setHelpUrl("");
        }
    };

    // Блок для задержки
    Blockly.Blocks['delay_block'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Задержка")
                .appendField(new Blockly.FieldNumber(1000, 0, 60000, 1), "TIME")
                .appendField("мс");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(160);
            this.setTooltip("Задержка в миллисекундах");
            this.setHelpUrl("");
        }
    };

    // Блок для получения миллисекунд
    Blockly.Blocks['millis_block'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Время работы (мс)");
            this.setOutput(true, 'Number');
            this.setColour(160);
            this.setTooltip("Возвращает время в миллисекундах с начала работы");
            this.setHelpUrl("");
        }
    };

    // Блок для Serial.begin
    Blockly.Blocks['serial_begin'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Serial начать с Baud")
                .appendField(new Blockly.FieldDropdown([
                    ["9600", "9600"],
                    ["115200", "115200"],
                    ["921600", "921600"]
                ]), "BAUD");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Инициализация Serial порта");
            this.setHelpUrl("");
        }
    };

    // Блок для Serial.print
    Blockly.Blocks['serial_print'] = {
        init: function() {
            this.appendValueInput("TEXT")
                .setCheck(["String", "Number", "Boolean"])
                .appendField("Serial напечатать");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Отправка данных в Serial порт");
            this.setHelpUrl("");
        }
    };

    // Блок для Serial.println
    Blockly.Blocks['serial_println'] = {
        init: function() {
            this.appendValueInput("TEXT")
                .setCheck(["String", "Number", "Boolean"])
                .appendField("Serial напечатать строку");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(300);
            this.setTooltip("Отправка данных в Serial порт с переводом строки");
            this.setHelpUrl("");
        }
    };

    // Добавьте больше блоков по необходимости...
}

// Генератор кода для ESP32 (C++)
Blockly.Cpp = new Blockly.Generator('C++');

// Определение генераторов для каждого блока
Blockly.Cpp['pin_mode'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
};

Blockly.Cpp['digital_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `digitalWrite(${pin}, ${state});\n`;
};

Blockly.Cpp['digital_read'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`digitalRead(${pin})`, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['analog_read'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`analogRead(${pin})`, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['pwm_write'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const value = Blockly.Cpp.valueToCode(block, 'VALUE', Blockly.Cpp.ORDER_ATOMIC) || '0';
    return `analogWrite(${pin}, ${value});\n`;
};

Blockly.Cpp['delay_block'] = function(block) {
    const time = block.getFieldValue('TIME');
    return `delay(${time});\n`;
};

Blockly.Cpp['millis_block'] = function(block) {
    return ['millis()', Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['serial_begin'] = function(block) {
    const baud = block.getFieldValue('BAUD');
    return `Serial.begin(${baud});\n`;
};

Blockly.Cpp['serial_print'] = function(block) {
    const text = Blockly.Cpp.valueToCode(block, 'TEXT', Blockly.Cpp.ORDER_ATOMIC) || '""';
    return `Serial.print(${text});\n`;
};

Blockly.Cpp['serial_println'] = function(block) {
    const text = Blockly.Cpp.valueToCode(block, 'TEXT', Blockly.Cpp.ORDER_ATOMIC) || '""';
    return `Serial.println(${text});\n`;
};

// Стандартные блоки
Blockly.Cpp['math_number'] = function(block) {
    const number = block.getFieldValue('NUM');
    return [number, Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['text'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return ['"' + text + '"', Blockly.Cpp.ORDER_ATOMIC];
};

Blockly.Cpp['logic_boolean'] = function(block) {
    const bool = block.getFieldValue('BOOL') === 'TRUE';
    return [bool ? 'true' : 'false', Blockly.Cpp.ORDER_ATOMIC];
};

// Генерация кода
function generateCode() {
    try {
        // Генерируем код функций setup_blocks и loop_blocks
        const allBlocks = window.workspace.getTopBlocks(false);
        let setupCode = '';
        let loopCode = '';
        
        for (const block of allBlocks) {
            const code = Blockly.Cpp.blockToCode(block);
            if (code) {
                // Простая эвристика: если блок не в цикле/условии, идет в setup
                if (block.type === 'pin_mode' || block.type === 'serial_begin') {
                    setupCode += code;
                } else {
                    loopCode += code;
                }
            }
        }
        
        const fullCode = `// Функция настройки блоков
void setup_blocks() {
${setupCode ? '    ' + setupCode.trim().replace(/\n/g, '\n    ') : '    // Нет блоков для setup'}
}

// Функция выполнения блоков
void loop_blocks() {
${loopCode ? '    ' + loopCode.trim().replace(/\n/g, '\n    ') : '    // Нет блоков для loop'}
}`;
        
        // Обновляем редактор кода
        if (window.codeViewer) {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
        
        updateStatus('Код успешно сгенерирован', 'success');
        return fullCode;
    } catch (error) {
        console.error('Ошибка генерации кода:', error);
        updateStatus('Ошибка генерации кода: ' + error.message, 'error');
        return '// Ошибка генерации кода\n';
    }
}

// Компиляция проекта
async function compileProject() {
    const code = generateCode();
    const options = {
        delay: document.getElementById('loopDelay').value,
        optimization: document.getElementById('optimization').value,
        libraries: []
    };
    
    if (document.getElementById('enableWifi').checked) {
        options.libraries.push('WiFi');
    }
    
    updateStatus('Компиляция проекта...', 'info');
    
    // Показываем прогресс
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '30%';
    
    try {
        const response = await fetch('/api/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, options })
        });
        
        progressBar.style.width = '70%';
        
        const result = await response.json();
        
        if (result.success) {
            progressBar.style.width = '100%';
            updateStatus(result.message || 'Компиляция успешна!', 'success');
            window.compiledBinary = result.binary;
            window.currentProjectId = result.projectId;
            
            // Загружаем список проектов
            loadProjects();
            
            // Показываем информацию о размере
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 2000);
        } else {
            progressBar.style.width = '0%';
            updateStatus(`Ошибка компиляции: ${result.error}`, 'error');
            console.error('Ошибка компиляции:', result);
        }
    } catch (error) {
        progressBar.style.width = '0%';
        updateStatus(`Ошибка сети: ${error.message}`, 'error');
        console.error('Ошибка сети:', error);
    }
}

// Сохранение проекта
async function saveProject() {
    const code = generateCode();
    const projectName = prompt('Введите имя проекта:', `Проект_${Date.now()}`);
    
    if (projectName) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.cpp`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        updateStatus(`Проект "${projectName}" сохранен`, 'success');
    }
}

// Загрузка проекта
function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.cpp,.txt,.blockly';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const text = await file.text();
            
            // Проверяем формат файла
            if (file.name.endsWith('.blockly')) {
                // Это Blockly XML
                const xml = Blockly.utils.xml.textToDom(text);
                window.workspace.clear();
                Blockly.Xml.domToWorkspace(xml, window.workspace);
                generateCode();
            } else {
                // Это C++ код
                if (window.codeViewer) {
                    window.codeViewer.setCode(text, 'cpp');
                    document.querySelector('[data-tab="code"]').click();
                }
            }
            
            updateStatus(`Проект "${file.name}" загружен`, 'success');
        }
    };
    
    input.click();
}
