// blocks.js

// В современных версиях Blockly генератор доступен глобально через javascript_compressed.js
const jsg = javascriptGenerator;

// Исправление инициализации переменных (убирает Deprecation Warning v12)
jsg.init = function(workspace) {
    // Обязательно создаем эти объекты, иначе будет ошибка 'reset' или 'undefined'
    jsg.definitions_ = Object.create(null);
    jsg.nameDB_ = new Blockly.Names(jsg.variableDB_ ? jsg.variableDB_.getNameType() : 'VARIABLE');
    
    const variables = workspace.getVariableMap().getAllVariables();
    const defvars = variables.map(v => 
        'float ' + v.name + ' = 0;'
    );
    if (defvars.length > 0) jsg.definitions_['variables'] = defvars.join('\n');
};

// --- ОПРЕДЕЛЕНИЕ БЛОКОВ ---

// Главная структура
Blockly.Blocks['esp32_main_structure'] = {
  init: function() {
    this.appendDummyInput().appendField("⚙️ ПРОГРАММА ESP32");
    this.appendStatementInput("SETUP").setCheck(null).appendField("При запуске:");
    this.appendStatementInput("LOOP").setCheck(null).appendField("В цикле:");
    this.setColour(285);
    this.setTooltip("Разместите блоки настройки и основного цикла здесь.");
  }
};

jsg.forBlock['esp32_main_structure'] = function(block, generator) {
  // Важно: генерируем код вложенных блоков вручную
  const setupCode = generator.statementToCode(block, 'SETUP');
  const loopCode = generator.statementToCode(block, 'LOOP');
  
  // Сохраняем результат в самом блоке для доступа из app.js
  block.userData = { setup: setupCode, loop: loopCode };
  return ""; 
};

// Задержка (Delay)
Blockly.Blocks['esp32_delay'] = {
  init: function() {
    this.appendDummyInput().appendField("Ждать (мс)").appendField(new Blockly.FieldNumber(1000), "MS");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(65);
  }
};
jsg.forBlock['esp32_delay'] = function(block) {
  return `delay(${block.getFieldValue('MS')});\n`;
};

// Serial Print
Blockly.Blocks['esp32_serial_print'] = {
  init: function() {
    this.appendValueInput("TXT").appendField("Serial: Печать");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
  }
};
jsg.forBlock['esp32_serial_print'] = function(block, generator) {
  const txt = generator.valueToCode(block, 'TXT', jsg.ORDER_ATOMIC) || '""';
  return `Serial.println(${txt});\n`;
};

// DHT11
Blockly.Blocks['esp32_dht_read'] = {
  init: function() {
    this.appendDummyInput().appendField("Температура DHT11 Пин").appendField(new Blockly.FieldNumber(4), "PIN");
    this.setOutput(true, "Number"); this.setColour(45);
  }
};
jsg.forBlock['esp32_dht_read'] = function(block) {
  const pin = block.getFieldValue('PIN');
  jsg.definitions_['inc_dht'] = `#include <DHT.h>\nDHT dht${pin}(${pin}, DHT11);`;
  return [`dht${pin}.readTemperature()`, jsg.ORDER_ATOMIC];
};

// Digital Write
Blockly.Blocks['esp32_digital_write'] = {
  init: function() {
    this.appendDummyInput().appendField("Пин").appendField(new Blockly.FieldNumber(2), "PIN")
        .appendField("Статус").appendField(new Blockly.FieldDropdown([["ВКЛ","HIGH"],["ВЫКЛ","LOW"]]), "VAL");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(20);
  }
};
jsg.forBlock['esp32_digital_write'] = function(block) {
  const pin = block.getFieldValue('PIN');
  const val = block.getFieldValue('VAL');
  return `pinMode(${pin}, OUTPUT);\ndigitalWrite(${pin}, ${val});\n`;
};
