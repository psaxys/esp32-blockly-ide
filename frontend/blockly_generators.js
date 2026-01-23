// Дополнительные генераторы кода для ESP32

// Генератор для циклов с условиями
Blockly.JavaScript['controls_whileUntil'] = function(block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    const argument0 = Blockly.JavaScript.valueToCode(block, 'BOOL',
        until ? Blockly.JavaScript.ORDER_LOGICAL_NOT :
        Blockly.JavaScript.ORDER_NONE) || 'false';
    
    let branch = Blockly.JavaScript.statementToCode(block, 'DO');
    branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
    
    let code = '';
    if (until) {
        code = 'while (!' + argument0 + ') {\n' + branch + '}\n';
    } else {
        code = 'while (' + argument0 + ') {\n' + branch + '}\n';
    }
    
    return code;
};

// Генератор для условных операторов
Blockly.JavaScript['controls_if'] = function(block) {
    let n = 0;
    let code = '';
    
    do {
        const condition = Blockly.JavaScript.valueToCode(block, 'IF' + n,
            Blockly.JavaScript.ORDER_NONE) || 'false';
        let branch = Blockly.JavaScript.statementToCode(block, 'DO' + n);
        branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
        
        code += (n === 0 ? 'if (' : 'else if (') + condition + ') {\n' + branch + '}\n';
        n++;
    } while (block.getInput('IF' + n));
    
    if (block.getInput('ELSE')) {
        let branch = Blockly.JavaScript.statementToCode(block, 'ELSE');
        branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
        code += 'else {\n' + branch + '}\n';
    }
    
    return code;
};

// Генератор для математических операций
Blockly.JavaScript['math_arithmetic'] = function(block) {
    const operator = block.getFieldValue('OP');
    const order = (operator === 'MULTIPLY' || operator === 'DIVIDE') ?
        Blockly.JavaScript.ORDER_MULTIPLICATIVE :
        Blockly.JavaScript.ORDER_ADDITIVE;
    
    const argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
    const argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
    
    const operators = {
        'ADD': [' + ', Blockly.JavaScript.ORDER_ADDITIVE],
        'MINUS': [' - ', Blockly.JavaScript.ORDER_ADDITIVE],
        'MULTIPLY': [' * ', Blockly.JavaScript.ORDER_MULTIPLICATIVE],
        'DIVIDE': [' / ', Blockly.JavaScript.ORDER_MULTIPLICATIVE],
        'POWER': [null, Blockly.JavaScript.ORDER_COMMA]  // Не поддерживается
    };
    
    const op = operators[operator];
    if (op === undefined) {
        throw new Error(`Неизвестный оператор: ${operator}`);
    }
    
    if (operator === 'POWER') {
        return ['Math.pow(' + argument0 + ', ' + argument1 + ')',
            Blockly.JavaScript.ORDER_FUNCTION_CALL];
    }
    
    return [argument0 + op[0] + argument1, order];
};

// Генератор для сравнений
Blockly.JavaScript['logic_compare'] = function(block) {
    const operator = block.getFieldValue('OP');
    const order = Blockly.JavaScript.ORDER_RELATIONAL;
    const argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
    const argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
    
    const operators = {
        'EQ': '==',
        'NEQ': '!=',
        'LT': '<',
        'LTE': '<=',
        'GT': '>',
        'GTE': '>='
    };
    
    const op = operators[operator];
    if (op === undefined) {
        throw new Error(`Неизвестный оператор сравнения: ${operator}`);
    }
    
    return [argument0 + ' ' + op + ' ' + argument1, order];
};

// Генератор для логических операций
Blockly.JavaScript['logic_operation'] = function(block) {
    const operator = block.getFieldValue('OP');
    const order = (operator === 'AND') ?
        Blockly.JavaScript.ORDER_LOGICAL_AND :
        Blockly.JavaScript.ORDER_LOGICAL_OR;
    
    const argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || 'false';
    const argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || 'false';
    
    const operators = {
        'AND': '&&',
        'OR': '||'
    };
    
    const op = operators[operator];
    if (op === undefined) {
        throw new Error(`Неизвестный логический оператор: ${operator}`);
    }
    
    return [argument0 + ' ' + op + ' ' + argument1, order];
};

// Генератор для случайных чисел
Blockly.JavaScript['math_random_int'] = function(block) {
    const from = Blockly.JavaScript.valueToCode(block, 'FROM',
        Blockly.JavaScript.ORDER_COMMA) || '0';
    const to = Blockly.JavaScript.valueToCode(block, 'TO',
        Blockly.JavaScript.ORDER_COMMA) || '1';
    
    return ['random(' + from + ', ' + to + ')',
        Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// Генератор для переменных
Blockly.JavaScript['variables_get'] = function(block) {
    const varName = Blockly.JavaScript.variableDB_.getName(
        block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
    return [varName, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['variables_set'] = function(block) {
    const varName = Blockly.JavaScript.variableDB_.getName(
        block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE',
        Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
    
    return varName + ' = ' + value + ';\n';
};

// Добавление функций в глобальный контекст
Blockly.JavaScript.addReservedWords('random,delay,pinMode,digitalWrite,digitalRead,analogRead,analogWrite,Serial,WiFi');

// Функция для генерации заголовка кода
Blockly.JavaScript.scrub_ = function(block, code) {
    const comment = block.getCommentText();
    let commentedCode = '';
    
    if (comment) {
        commentedCode += '// ' + comment + '\n';
    }
    
    commentedCode += code;
    return commentedCode;
};
