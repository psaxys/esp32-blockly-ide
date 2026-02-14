// Конфигурация Blockly 12.3.1 для ESP32
document.addEventListener('DOMContentLoaded', function() {
    if (window.workspace) return;

    const blocklyDiv = document.getElementById('blocklyDiv');
    if (!blocklyDiv) return;

    try {
        // 1. Инициализация Workspace
        window.workspace = Blockly.inject(blocklyDiv, {
            toolbox: getToolboxConfig(),
            grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
            trashcan: true,
            zoom: { controls: true, wheel: true }
        });

        // 2. Создание генератора Arduino (C++), если он еще не создан
        if (!Blockly.Arduino) {
            Blockly.Arduino = new Blockly.Generator('Arduino');
            Blockly.Arduino.addReservedWords('setup,loop,if,else,for,while,switch,case,break,int,float,char,long,static,volatile');
            Blockly.Arduino.ORDER_ATOMIC = 0;
            Blockly.Arduino.ORDER_NONE = 99;

            // Базовая инициализация
            Blockly.Arduino.init = function(workspace) {
                Blockly.Arduino.definitions_ = Object.create(null);
                Blockly.Arduino.setups_ = Object.create(null);
                if (!Blockly.Arduino.variableDB_) {
                    Blockly.Arduino.variableDB_ = new Blockly.Names(Blockly.Names.DEVELOPER_VARIABLE_TYPE);
                }
                Blockly.Arduino.variableDB_.reset();
                Blockly.Arduino.variableDB_.setVariableMap(workspace.getVariableMap());
            };

            Blockly.Arduino.finish = function(code) {
                return code;
            };

            Blockly.Arduino.scrub_ = function(block, code, opt_thisOnly) {
                const nextBlock = block.getNextBlock();
                const nextCode = (nextBlock && !opt_thisOnly) ? Blockly.Arduino.blockToCode(nextBlock) : '';
                return code + nextCode;
            };
        }

        // 3. Определяем правила для стандартных блоков (Циклы, Логика, Математика)
        
        // Числа
        Blockly.Arduino.forBlock['math_number'] = function(block) {
            return [parseFloat(block.getFieldValue('NUM')), Blockly.Arduino.ORDER_ATOMIC];
        };

        // Логика IF
        Blockly.Arduino.forBlock['controls_if'] = function(block, generator) {
            let n = 0;
            let code = '';
            do {
                const conditionCode = generator.valueToCode(block, 'IF' + n, Blockly.Arduino.ORDER_NONE) || 'false';
                const branchCode = generator.statementToCode(block, 'DO' + n);
                code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {\n${branchCode}}`;
                n++;
            } while (block.getInput('IF' + n));

            if (block.getInput('ELSE')) {
                const branchCode = generator.statementToCode(block, 'ELSE');
                code += ` else {\n${branchCode}}`;
            }
            return code + '\n';
        };

        // Цикл WHILE / UNTIL (Ваша ошибка была здесь)
        Blockly.Arduino.forBlock['controls_whileUntil'] = function(block, generator) {
            const mode = block.getFieldValue('MODE');
            const argument0 = generator.valueToCode(block, 'BOOL', Blockly.Arduino.ORDER_NONE) || 'false';
            let branch = generator.statementToCode(block, 'DO');
            const op = (mode === 'UNTIL') ? '!' : '';
            return `while (${op}${argument0}) {\n${branch}}\n`;
        };

        // Переменные (SET)
        Blockly.Arduino.forBlock['variables_set'] = function(block, generator) {
            const argument0 = generator.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_NONE) || '0';
            const varName = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
            return varName + ' = ' + argument0 + ';\n';
        };

        // Переменные (GET)
        Blockly.Arduino.forBlock['variables_get'] = function(block, generator) {
            const varName = generator.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
            return [varName, Blockly.Arduino.ORDER_ATOMIC];
        };

        // 4. Авто-генерация кода при изменениях
        window.workspace.addChangeListener(function(event) {
            if (event.type !== Blockly.Events.UI) {
                generateCode();
            }
        });

        console.log('Blockly и Arduino Generator успешно инициализированы');
    } catch (e) {
        console.error('Ошибка инициализации:', e);
    }
});

// Основная функция генерации
function generateCode() {
    try {
        const blockCode = Blockly.Arduino.workspaceToCode(window.workspace);
        
        // Формируем структуру Arduino IDE / PlatformIO
        const fullCode = `#include <Arduino.h>

// Глобальные переменные и определения
${Object.values(Blockly.Arduino.definitions_ || {}).join('\n')}

void setup() {
    Serial.begin(115200);
    ${Object.values(Blockly.Arduino.setups_ || {}).join('\n    ')}
    Serial.println("ESP32 Started");
}

void loop() {
${blockCode || '    // Добавьте блоки для выполнения'}
}`;

        // Обновляем Monaco Editor через ваш CodeViewer
        if (window.codeViewer && typeof window.codeViewer.setCode === 'function') {
            window.codeViewer.setCode(fullCode, 'cpp');
        }
        
        updateStatus('Код сгенерирован', 'success');
        return fullCode;
    } catch (error) {
        console.error('Ошибка генерации кода:', error);
        updateStatus('Ошибка: ' + error.message, 'error');
        return '';
    }
}

// Конфигурация Toolbox (сокращенная версия для примера)
function getToolboxConfig() {
    return {
        'kind': 'categoryToolbox',
        'contents': [
            {
                'kind': 'category',
                'name': 'Логика',
                'colour': '210',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_if' },
                    { 'kind': 'block', 'type': 'logic_compare' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Циклы',
                'colour': '120',
                'contents': [
                    { 'kind': 'block', 'type': 'controls_whileUntil' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Математика',
                'colour': '230',
                'contents': [
                    { 'kind': 'block', 'type': 'math_number' }
                ]
            },
            {
                'kind': 'category',
                'name': 'Переменные',
                'custom': 'VARIABLE',
                'colour': '330'
            }
        ]
    };
}
