const jsg = javascriptGenerator;
jsg.ORDER_ATOMIC = 0;

// Инициализация генератора (v12+ стандарт)
jsg.init = function(workspace) {
    jsg.definitions_ = Object.create(null);
    jsg.variableDB_ = new Blockly.Names(jsg.NAME_TYPE);
    
    const variables = workspace.getVariableMap().getAllVariables();
    const defvars = variables.map(v => 
        'float ' + jsg.variableDB_.getName(v.name, Blockly.VARIABLE_CATEGORY_NAME) + ' = 0;'
    );
    
    if (defvars.length > 0) {
        jsg.definitions_['variables'] = defvars.join('\n');
    }
};

// Блок структуры Setup/Loop
Blockly.Blocks['esp32_main_structure'] = {
  init: function() {
    this.appendDummyInput().appendField("⚙️ ПРОГРАММА ESP32");
    this.appendStatementInput("SETUP").setCheck(null).appendField("При запуске:");
    this.appendStatementInput("LOOP").setCheck(null).appendField("Постоянно (цикл):");
    this.setColour(285);
  }
};
jsg.forBlock['esp32_main_structure'] = function(block, generator) {
  block.generatedSetup = generator.statementToCode(block, 'SETUP');
  block.generatedLoop = generator.statementToCode(block, 'LOOP');
  return ""; 
};

// Цифровой вывод
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

// Задержка
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
    this.appendValueInput("TXT").appendField("Serial Печать");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour(160);
  }
};
jsg.forBlock['esp32_serial_print'] = function(block, generator) {
  const txt = generator.valueToCode(block, 'TXT', jsg.ORDER_ATOMIC) || '""';
  return `Serial.println(${txt});\n`;
};

// Датчик DHT11
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
