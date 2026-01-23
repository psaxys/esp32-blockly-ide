#!/usr/bin/env python3
"""
Скрипт для загрузки Blockly 12.3.1 и его ресурсов
"""

import os
import requests
import zipfile
import io
from pathlib import Path

BLOCKLY_VERSION = "12.3.1"
BLOCKLY_CDN_URL = f"https://unpkg.com/blockly@{BLOCKLY_VERSION}/"
BLOCKLY_FILES = [
    "blockly.min.js",
    "blockly.min.js.map",
    "blockly_compressed.js",
    "blockly_compressed.js.map",
    "blocks_compressed.js",
    "blocks_compressed.js.map",
    "python_compressed.js",
    "python_compressed.js.map",
    "javascript_compressed.js",
    "javascript_compressed.js.map",
    "lua_compressed.js",
    "lua_compressed.js.map",
    "php_compressed.js",
    "php_compressed.js.map",
    "dart_compressed.js",
    "dart_compressed.js.map",
    "msg/js/ru.js",
    "msg/js/en.js",
    "msg/js/es.js",
    "msg/js/de.js",
    "msg/js/fr.js",
    "media/sprites.png",
    "media/sprites.svg",
    "media/disconnect.wav",
    "media/delete.wav"
]

def download_blockly():
    """Загружает файлы Blockly"""
    assets_dir = Path("/app/blockly-assets")
    assets_dir.mkdir(exist_ok=True)
    
    print(f"📥 Загрузка Blockly {BLOCKLY_VERSION}...")
    
    for file in BLOCKLY_FILES:
        file_path = assets_dir / file
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        url = BLOCKLY_CDN_URL + file
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Загружено: {file}")
            
        except Exception as e:
            print(f"❌ Ошибка загрузки {file}: {e}")

if __name__ == "__main__":
    download_blockly()
