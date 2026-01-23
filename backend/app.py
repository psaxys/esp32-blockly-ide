import os
import json
import shutil
import subprocess
from pathlib import Path
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import tempfile
from datetime import datetime
import jwt
from functools import wraps

from blockly_utils import BlocklyGenerator

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Конфигурация
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
app.config['PROJECTS_DIR'] = Path("/app/projects")
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Создание директорий
for dir_path in [app.config['PROJECTS_DIR'], Path("/app/blockly-assets")]:
    dir_path.mkdir(exist_ok=True)

# JWT аутентификация (опционально)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def index():
    return jsonify({
        "status": "ESP32 Blockly Backend",
        "version": "2.0",
        "blockly_version": "12.3.1",
        "endpoints": {
            "blocks": "/api/blocks",
            "generate": "/api/generate",
            "compile": "/api/compile",
            "projects": "/api/projects",
            "upload": "/api/upload",
            "toolbox": "/api/toolbox"
        }
    })

@app.route('/api/toolbox', methods=['GET'])
def get_toolbox():
    """Возвращает кастомный toolbox для Blockly"""
    toolbox = BlocklyGenerator.create_toolbox()
    return jsonify(toolbox)

@app.route('/api/blocks', methods=['GET'])
def get_blocks():
    """Возвращает определения кастомных блоков для ESP32"""
    blocks_definitions = {
        "blocks": [
            {
                "type": "esp32_pin_mode",
                "message0": "Настрой пин %1 как %2",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "PIN",
                        "value": 2,
                        "min": 0,
                        "max": 39,
                        "precision": 1
                    },
                    {
                        "type": "field_dropdown",
                        "name": "MODE",
                        "options": [
                            ["выход", "OUTPUT"],
                            ["вход", "INPUT"],
                            ["вход с подтяжкой", "INPUT_PULLUP"],
                            ["вход с подтяжкой вниз", "INPUT_PULLDOWN"]
                        ]
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 230,
                "tooltip": "Настраивает режим работы GPIO пина",
                "helpUrl": "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html"
            },
            {
                "type": "esp32_digital_write",
                "message0": "Установи пин %1 в %2",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "PIN",
                        "value": 2,
                        "min": 0,
                        "max": 39
                    },
                    {
                        "type": "field_dropdown",
                        "name": "STATE",
                        "options": [
                            ["HIGH (3.3V)", "HIGH"],
                            ["LOW (0V)", "LOW"]
                        ]
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 230,
                "tooltip": "Устанавливает цифровое значение на пине"
            },
            {
                "type": "esp32_digital_read",
                "message0": "Прочитай пин %1",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "PIN",
                        "value": 2,
                        "min": 0,
                        "max": 39
                    }
                ],
                "output": "Boolean",
                "colour": 230,
                "tooltip": "Читает цифровое значение с пина"
            },
            {
                "type": "esp32_delay",
                "message0": "Пауза %1 мс",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "TIME",
                        "value": 1000,
                        "min": 0,
                        "precision": 1
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 120,
                "tooltip": "Задержка в миллисекундах"
            },
            {
                "type": "esp32_wifi_connect",
                "message0": "Подключись к WiFi: SSID %1 Пароль %2",
                "args0": [
                    {
                        "type": "field_input",
                        "name": "SSID",
                        "text": "MyWiFi"
                    },
                    {
                        "type": "field_input",
                        "name": "PASSWORD",
                        "text": "password123"
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 260,
                "tooltip": "Подключается к WiFi сети"
            },
            {
                "type": "esp32_serial_print",
                "message0": "Вывод в Serial: %1",
                "args0": [
                    {
                        "type": "input_value",
                        "name": "TEXT",
                        "check": "String"
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 160,
                "tooltip": "Выводит текст в последовательный порт"
            },
            {
                "type": "esp32_analog_read",
                "message0": "Аналоговое чтение пина %1",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "PIN",
                        "value": 34,
                        "min": 32,
                        "max": 39
                    }
                ],
                "output": "Number",
                "colour": 230,
                "tooltip": "Читает аналоговое значение (0-4095)"
            },
            {
                "type": "esp32_analog_write",
                "message0": "Аналоговая запись пин %1 значение %2",
                "args0": [
                    {
                        "type": "field_number",
                        "name": "PIN",
                        "value": 2,
                        "min": 0,
                        "max": 39
                    },
                    {
                        "type": "input_value",
                        "name": "VALUE",
                        "check": "Number"
                    }
                ],
                "previousStatement": None,
                "nextStatement": None,
                "colour": 230,
                "tooltip": "ШИМ сигнал на пин (0-255)"
            },
            {
                "type": "esp32_millis",
                "message0": "время с начала работы (мс)",
                "output": "Number",
                "colour": 120,
                "tooltip": "Возвращает время в миллисекундах с начала работы программы"
            },
            {
                "type": "esp32_wifi_status",
                "message0": "статус WiFi",
                "output": "Boolean",
                "colour": 260,
                "tooltip": "Возвращает true если WiFi подключен"
            }
        ]
    }
    
    return jsonify(blocks_definitions)

@app.route('/api/generate', methods=['POST'])
def generate_code():
    """Генерирует Arduino код из Blockly XML"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        xml_content = data.get('xml')
        
        if not xml_content:
            return jsonify({"error": "No XML content"}), 400
        
        # Генерация кода
        generated_code = BlocklyGenerator.generate_arduino_code(xml_content)
        
        # Сохранение временной копии
        temp_dir = Path("/tmp/esp32_blockly")
        temp_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"esp32_sketch_{timestamp}.ino"
        filepath = temp_dir / filename
        
        filepath.write_text(generated_code)
        
        return jsonify({
            "success": True,
            "code": generated_code,
            "filename": filename,
            "filepath": str(filepath),
            "timestamp": timestamp,
            "message": "Код успешно сгенерирован"
        })
        
    except Exception as e:
        app.logger.error(f"Error generating code: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/api/compile', methods=['POST'])
def compile_code():
    """Компилирует код для ESP32 (демо-режим с расширенной логикой)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        code = data.get('code')
        board = data.get('board', 'esp32dev')
        
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        # Создание временного проекта
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            
            # Создаем основной файл .ino
            sketch_file = tmp_path / "esp32_sketch.ino"
            sketch_file.write_text(code)
            
            # Создаем platformio.ini
            platformio_ini = f"""[env:{board}]
platform = espressif32
board = {board}
framework = arduino
monitor_speed = 115200
upload_speed = 921600
"""
            (tmp_path / "platformio.ini").write_text(platformio_ini)
            
            # В реальной реализации здесь будет вызов PlatformIO CLI
            # Для демо-режима имитируем компиляцию
            
            # Генерация фейкового бинарного файла
            binary_content = b"Mock binary for ESP32 firmware"
            binary_path = tmp_path / "firmware.bin"
            binary_path.write_bytes(binary_content)
            
            # Расчет размера
            binary_size = len(binary_content)
            
            return jsonify({
                "success": True,
                "message": "Компиляция успешно завершена (демо-режим)",
                "binary_size": binary_size,
                "binary_path": str(binary_path),
                "estimated_flash": f"{binary_size} bytes",
                "board": board,
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        app.logger.error(f"Error compiling code: {str(e)}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_to_esp32():
    """Загрузка прошивки на ESP32 (демо)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        port = data.get('port', '/dev/ttyUSB0')
        baudrate = data.get('baudrate', 921600)
        
        # Демо-режим: имитация загрузки
        import time
        time.sleep(2)  # Имитация процесса загрузки
        
        return jsonify({
            "success": True,
            "message": "Прошивка успешно загружена на ESP32 (демо)",
            "port": port,
            "baudrate": baudrate,
            "steps": [
                "Подключение к ESP32... OK",
                "Стирание флеш-памяти... OK",
                "Запись прошивки... OK",
                "Верификация... OK",
                "Перезагрузка... OK"
            ],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/api/projects', methods=['GET'])
def list_projects():
    """Список всех проектов"""
    try:
        projects = []
        projects_dir = app.config['PROJECTS_DIR']
        
        for item in projects_dir.iterdir():
            if item.is_dir():
                metadata_file = item / "metadata.json"
                if metadata_file.exists():
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                        projects.append(metadata)
                else:
                    projects.append({
                        "name": item.name,
                        "created": item.stat().st_ctime,
                        "modified": item.stat().st_mtime
                    })
        
        # Сортировка по дате изменения
        projects.sort(key=lambda x: x.get('modified', 0), reverse=True)
        
        return jsonify({
            "success": True,
            "projects": projects,
            "count": len(projects)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<project_name>', methods=['GET'])
def get_project(project_name):
    """Получить информацию о проекте"""
    try:
        project_dir = app.config['PROJECTS_DIR'] / project_name
        
        if not project_dir.exists():
            return jsonify({"error": "Project not found"}), 404
            
        # Чтение метаданных
        metadata_file = project_dir / "metadata.json"
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {
                "name": project_name,
                "created": project_dir.stat().st_ctime,
                "modified": project_dir.stat().st_mtime
            }
        
        # Чтение файлов проекта
        files = {}
        for file_path in project_dir.iterdir():
            if file_path.is_file():
                try:
                    files[file_path.name] = file_path.read_text()
                except:
                    files[file_path.name] = "Binary file"
        
        return jsonify({
            "success": True,
            "metadata": metadata,
            "files": files
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Создание нового проекта"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        project_name = data.get('name')
        
        if not project_name:
            return jsonify({"error": "Project name required"}), 400
            
        # Очистка имени проекта
        import re
        project_name = re.sub(r'[^\w\-]', '_', project_name)
        
        project_dir = app.config['PROJECTS_DIR'] / project_name
        
        if project_dir.exists():
            return jsonify({"error": "Project already exists"}), 400
            
        project_dir.mkdir()
        
        # Создание метаданных
        metadata = {
            "name": project_name,
            "created": datetime.now().isoformat(),
            "modified": datetime.now().isoformat(),
            "version": "1.0.0",
            "description": data.get('description', ''),
            "blocks": data.get('blocks', {}),
            "code": data.get('code', '')
        }
        
        metadata_file = project_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Сохранение XML если есть
        if data.get('xml'):
            xml_file = project_dir / "project.xml"
            xml_file.write_text(data['xml'])
        
        # Сохранение кода если есть
        if data.get('code'):
            code_file = project_dir / "sketch.ino"
            code_file.write_text(data['code'])
        
        return jsonify({
            "success": True,
            "message": f"Project '{project_name}' created",
            "project": metadata
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<project_name>', methods=['PUT'])
def update_project(project_name):
    """Обновление проекта"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        project_dir = app.config['PROJECTS_DIR'] / project_name
        
        if not project_dir.exists():
            return jsonify({"error": "Project not found"}), 404
        
        # Чтение существующих метаданных
        metadata_file = project_dir / "metadata.json"
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
        else:
            metadata = {"name": project_name}
        
        # Обновление метаданных
        metadata.update({
            "modified": datetime.now().isoformat(),
            "version": data.get('version', metadata.get('version', '1.0.0')),
            "description": data.get('description', metadata.get('description', '')),
            "blocks": data.get('blocks', metadata.get('blocks', {})),
            "code": data.get('code', metadata.get('code', ''))
        })
        
        # Сохранение метаданных
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Обновление файлов
        if data.get('xml'):
            xml_file = project_dir / "project.xml"
            xml_file.write_text(data['xml'])
        
        if data.get('code'):
            code_file = project_dir / "sketch.ino"
            code_file.write_text(data['code'])
        
        return jsonify({
            "success": True,
            "message": f"Project '{project_name}' updated",
            "project": metadata
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<project_name>', methods=['DELETE'])
def delete_project(project_name):
    """Удаление проекта"""
    try:
        project_dir = app.config['PROJECTS_DIR'] / project_name
        
        if not project_dir.exists():
            return jsonify({"error": "Project not found"}), 404
            
        # Безопасное удаление
        import shutil
        shutil.rmtree(project_dir)
        
        return jsonify({
            "success": True,
            "message": f"Project '{project_name}' deleted"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/boards', methods=['GET'])
def get_supported_boards():
    """Возвращает список поддерживаемых плат ESP32"""
    boards = [
        {
            "id": "esp32dev",
            "name": "ESP32 DevKit",
            "description": "ESP32 Development Board",
            "flash_size": "4MB",
            "psram": false,
            "usb": true
        },
        {
            "id": "node32s",
            "name": "NodeMCU-32S",
            "description": "NodeMCU ESP32-S",
            "flash_size": "4MB",
            "psram": false,
            "usb": true
        },
        {
            "id": "esp32cam",
            "name": "ESP32-CAM",
            "description": "ESP32 Camera Module",
            "flash_size": "4MB",
            "psram": true,
            "usb": false
        },
        {
            "id": "esp32s3dev",
            "name": "ESP32-S3 DevKit",
            "description": "ESP32-S3 Development Board",
            "flash_size": "8MB",
            "psram": true,
            "usb": true
        },
        {
            "id": "esp32c3dev",
            "name": "ESP32-C3 DevKit",
            "description": "ESP32-C3 Development Board",
            "flash_size": "4MB",
            "psram": false,
            "usb": true
        }
    ]
    
    return jsonify({
        "success": True,
        "boards": boards
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка здоровья сервера"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0",
        "blockly": "12.3.1",
        "python": "3.11",
        "projects_count": len(list(app.config['PROJECTS_DIR'].iterdir()))
    })

# WebSocket для реального времени
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    emit('connected', {'data': 'Connected to ESP32 Blockly Server'})

@socketio.on('compile_status')
def handle_compile_status(data):
    emit('compile_update', {'status': 'compiling', 'progress': 50})
    # Имитация процесса компиляции
    import time
    time.sleep(1)
    emit('compile_update', {'status': 'success', 'progress': 100})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
