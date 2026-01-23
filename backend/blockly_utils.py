import json
import os
from pathlib import Path

class BlocklyGenerator:
    """Генератор кода ESP32 из Blockly XML"""
    
    @staticmethod
    def generate_arduino_code(xml_content):
        """
        Конвертирует Blockly XML в Arduino код для ESP32
        """
        # В реальной реализации здесь будет парсинг XML и генерация кода
        # Для демонстрации возвращаем шаблонный код
        
        template = """// Код сгенерирован ESP32 Blockly Programmer
// Версия Blockly: 12.3.1
// Платформа: ESP32 Arduino Core

#include <Arduino.h>
#include <WiFi.h>

// Конфигурация пинов
void setupPins() {
    // Настройка пинов будет здесь
}

// Подключение к WiFi
void connectToWiFi(const char* ssid, const char* password) {
    Serial.print("Подключение к ");
    Serial.println(ssid);
    
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.println("WiFi подключен!");
        Serial.print("IP адрес: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println();
        Serial.println("Не удалось подключиться к WiFi");
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\\n=== ESP32 Blockly Program ===");
    Serial.println("Версия: 1.0");
    Serial.println("Blockly: 12.3.1");
    Serial.println("==============================\\n");
    
    // Инициализация пинов
    setupPins();
    
    // Здесь будет сгенерированный код setup
    %SETUP_CODE%
}

void loop() {
    // Здесь будет сгенерированный код loop
    %LOOP_CODE%
    
    // Задержка для стабильности
    delay(10);
}
"""
        
        # Простой парсер для демонстрации
        setup_code = ""
        loop_code = ""
        
        if "pinMode" in xml_content:
            setup_code += "    pinMode(2, OUTPUT); // Пример настройки пина\\n"
        
        if "digitalWrite" in xml_content:
            loop_code += """    // Пример мигания светодиодом
    digitalWrite(2, HIGH);
    delay(1000);
    digitalWrite(2, LOW);
    delay(1000);
"""
        
        if "Serial.println" in xml_content:
            loop_code += '    Serial.println("Hello from ESP32!");\\n'
        
        if "WiFi" in xml_content:
            setup_code += """    // Подключение к WiFi
    connectToWiFi("your-ssid", "your-password");
"""
        
        code = template.replace("%SETUP_CODE%", setup_code)
        code = code.replace("%LOOP_CODE%", loop_code)
        
        return code
    
    @staticmethod
    def create_toolbox():
        """Создает кастомный набор блоков для ESP32"""
        toolbox = {
            "kind": "categoryToolbox",
            "contents": [
                {
                    "kind": "category",
                    "name": "📋 Основные",
                    "colour": "#5C81A6",
                    "contents": [
                        {"kind": "block", "type": "controls_if"},
                        {"kind": "block", "type": "logic_compare"},
                        {"kind": "block", "type": "math_number"},
                        {"kind": "block", "type": "text"},
                        {"kind": "block", "type": "variables_get"},
                        {"kind": "block", "type": "variables_set"}
                    ]
                },
                {
                    "kind": "category",
                    "name": "⚡ GPIO",
                    "colour": "#E67E22",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "esp32_pin_mode",
                            "fields": {
                                "PIN": 2,
                                "MODE": "OUTPUT"
                            }
                        },
                        {
                            "kind": "block",
                            "type": "esp32_digital_write",
                            "fields": {
                                "PIN": 2,
                                "STATE": "HIGH"
                            }
                        },
                        {
                            "kind": "block",
                            "type": "esp32_digital_read",
                            "fields": {
                                "PIN": 2
                            }
                        },
                        {
                            "kind": "block",
                            "type": "esp32_analog_read"
                        },
                        {
                            "kind": "block",
                            "type": "esp32_analog_write"
                        }
                    ]
                },
                {
                    "kind": "category",
                    "name": "⏱️ Время",
                    "colour": "#27AE60",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "esp32_delay",
                            "fields": {
                                "TIME": 1000
                            }
                        },
                        {
                            "kind": "block",
                            "type": "esp32_millis"
                        }
                    ]
                },
                {
                    "kind": "category",
                    "name": "📶 WiFi",
                    "colour": "#9B59B6",
                    "contents": [
                        {
                            "kind": "block",
                            "type": "esp32_wifi_connect"
                        },
                        {
                            "kind": "block",
                            "type": "esp32_wifi_status"
                        }
                    ]
                },
                {
                    "kind": "category",
                    "name": "🔄 Циклы",
                    "colour": "#3498DB",
                    "contents": [
                        {"kind": "block", "type": "controls_repeat_ext"},
                        {"kind": "block", "type": "controls_whileUntil"}
                    ]
                },
                {
                    "kind": "category",
                    "name": "📊 Логика",
                    "colour": "#8E44AD",
                    "contents": [
                        {"kind": "block", "type": "logic_operation"},
                        {"kind": "block", "type": "logic_boolean"},
                        {"kind": "block", "type": "logic_null"}
                    ]
                },
                {
                    "kind": "category",
                    "name": "🔢 Математика",
                    "colour": "#D35400",
                    "contents": [
                        {"kind": "block", "type": "math_arithmetic"},
                        {"kind": "block", "type": "math_random_int"}
                    ]
                }
            ]
        }
        
        return toolbox
