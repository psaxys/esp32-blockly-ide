// Улучшенный WebSerial загрузчик для ESP32
class ESP32WebSerialUploader {
    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.baudRate = 115200;
        this.isConnected = false;
        this.uploadCallbacks = {
            onProgress: null,
            onComplete: null,
            onError: null
        };
    }

    async connect() {
        try {
            if (!window.isSecureContext) {
                throw new Error('WebSerial API доступен только в безопасном контексте (HTTPS или localhost). Откройте IDE по https:// или http://localhost.');
            }

            if (!('serial' in navigator)) {
                throw new Error('WebSerial API недоступен в этом браузере/профиле. Для Яндекс Браузера включите экспериментальные веб-платформы (chrome://flags -> #enable-experimental-web-platform-features) и проверьте разрешения сайта.');
            }

            // Запрашиваем порт
            this.port = await navigator.serial.requestPort();
            
            // Открываем порт с настройками
            await this.port.open({
                baudRate: parseInt(this.baudRate),
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none',
                bufferSize: 1024
            });

            this.isConnected = true;
            updateStatus('Устройство подключено', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка подключения:', error);
            updateStatus(`Ошибка подключения: ${error.message}`, 'error');
            return false;
        }
    }

    async disconnect() {
        if (this.reader) {
            this.reader.cancel();
            this.reader = null;
        }
        
        if (this.writer) {
            await this.writer.close();
            this.writer = null;
        }
        
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
        
        this.isConnected = false;
        updateStatus('Устройство отключено', 'info');
    }

    async sendCommand(command, waitForResponse = false, timeout = 1000) {
        if (!this.port || !this.port.writable) {
            throw new Error('Порт не доступен для записи');
        }

        const writer = this.port.writable.getWriter();
        const encoder = new TextEncoder();
        
        try {
            await writer.write(encoder.encode(command));
            await writer.ready;
            await writer.releaseLock();
            
            if (waitForResponse) {
                return await this.readResponse(timeout);
            }
        } catch (error) {
            await writer.releaseLock();
            throw error;
        }
        
        return '';
    }

    async readResponse(timeout = 1000) {
        if (!this.port || !this.port.readable) {
            throw new Error('Порт не доступен для чтения');
        }

        const reader = this.port.readable.getReader();
        const decoder = new TextDecoder();
        let response = '';
        let startTime = Date.now();

        try {
            while (Date.now() - startTime < timeout) {
                const { value, done } = await reader.read();
                if (done) break;
                
                response += decoder.decode(value);
                
                // Проверяем завершающие символы
                if (response.includes('ready') || response.includes('CSUM')) {
                    break;
                }
            }
        } finally {
            reader.releaseLock();
        }

        return response;
    }

    async enterBootloader() {
        try {
            updateStatus('Вход в bootloader режим...', 'info');
            
            // Сбрасываем в bootloader
            await this.sendCommand('\r\n');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.sendCommand('\r\n');
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Отправляем команду для входа в bootloader
            await this.sendCommand('\x03'); // Ctrl+C
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.sendCommand('\x03'); // Ctrl+C
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Проверяем ответ
            const response = await this.readResponse(500);
            
            if (response.includes('boot') || response.includes('ets')) {
                updateStatus('Устройство в bootloader режиме', 'success');
                return true;
            } else {
                // Пробуем аппаратный сброс
                await this.hardReset();
                return false;
            }
        } catch (error) {
            console.error('Ошибка входа в bootloader:', error);
            return false;
        }
    }

    async hardReset() {
        try {
            // Пытаемся сбросить через DTR/RTS
            if (this.port) {
                await this.port.setSignals({
                    dataTerminalReady: false,
                    requestToSend: true
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                await this.port.setSignals({
                    dataTerminalReady: true,
                    requestToSend: false
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                return true;
            }
        } catch (error) {
            console.error('Ошибка аппаратного сброса:', error);
        }
        return false;
    }

    async uploadBinary(base64Binary, callbacks = {}) {
        try {
            this.uploadCallbacks = { ...this.uploadCallbacks, ...callbacks };
            
            // Проверяем подключение
            if (!this.isConnected && !(await this.connect())) {
                throw new Error('Не удалось подключиться к устройству');
            }

            // Входим в bootloader
            if (!(await this.enterBootloader())) {
                throw new Error('Не удалось войти в bootloader режим');
            }

            // Декодируем бинарные данные
            const binaryString = atob(base64Binary);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            updateStatus('Начинаю загрузку прошивки...', 'info');
            
            // Отправляем данные
            const chunkSize = 4096;
            const totalChunks = Math.ceil(bytes.length / chunkSize);
            
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
                
                // Создаем нового writer для каждого чанка
                const writer = this.port.writable.getWriter();
                await writer.write(chunk);
                await writer.ready;
                await writer.releaseLock();
                
                // Обновляем прогресс
                const progress = Math.round((i / bytes.length) * 100);
                if (this.uploadCallbacks.onProgress) {
                    this.uploadCallbacks.onProgress(progress);
                }
                
                // Небольшая задержка между чанками
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Завершаем загрузку
            await this.sendCommand('\x04', true, 1000); // Ctrl+D
            
            updateStatus('Прошивка успешно загружена!', 'success');
            
            if (this.uploadCallbacks.onComplete) {
                this.uploadCallbacks.onComplete();
            }
            
            // Перезагружаем ESP32
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.hardReset();
            
            return true;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            updateStatus(`Ошибка загрузки: ${error.message}`, 'error');
            
            if (this.uploadCallbacks.onError) {
                this.uploadCallbacks.onError(error);
            }
            
            return false;
        } finally {
            await this.disconnect();
        }
    }

    async readSerialOutput(callback) {
        if (!this.port || !this.port.readable) return;
        
        const reader = this.port.readable.getReader();
        const decoder = new TextDecoder();
        
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const text = decoder.decode(value);
                if (callback) callback(text);
            }
        } catch (error) {
            console.error('Ошибка чтения Serial:', error);
        } finally {
            reader.releaseLock();
        }
    }
}

// Глобальные функции для интерфейса
async function uploadToESP32() {
    if (!window.compiledBinary) {
        updateStatus('Сначала скомпилируйте проект!', 'warning');
        return;
    }

    // Показываем модальное окно
    showModal('uploadModal');
    
    const uploader = new ESP32WebSerialUploader();
    const progressBar = document.getElementById('uploadProgress');
    const percentElement = document.getElementById('uploadPercent');
    const statusElement = document.getElementById('uploadStatus');
    
    // Обновляем шаги
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    
    // Подключаемся
    const connected = await uploader.connect();
    if (!connected) {
        statusElement.textContent = 'Не удалось подключиться к устройству';
        return;
    }
    
    // Переходим к шагу 2
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    // Начинаем загрузку
    const success = await uploader.uploadBinary(window.compiledBinary, {
        onProgress: (progress) => {
            progressBar.style.width = `${progress}%`;
            percentElement.textContent = `${progress}%`;
            statusElement.textContent = `Загрузка: ${progress}%`;
        },
        onComplete: () => {
            progressBar.style.width = '100%';
            percentElement.textContent = '100%';
            statusElement.textContent = 'Загрузка завершена!';
            
            // Переходим к шагу 3
            setTimeout(() => {
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step3').classList.add('active');
                document.getElementById('completionMessage').textContent = 
                    'Прошивка успешно загружена! ESP32 перезагружается...';
            }, 1000);
        },
        onError: (error) => {
            statusElement.textContent = `Ошибка: ${error.message}`;
            progressBar.style.backgroundColor = '#f56565';
        }
    });
    
    if (!success) {
        statusElement.textContent = 'Ошибка загрузки прошивки';
    }
}

async function detectESP32() {
    try {
        const uploader = new ESP32WebSerialUploader();
        const connected = await uploader.connect();
        
        if (connected) {
            updateStatus('ESP32 обнаружен!', 'success');
            document.getElementById('uploadStatus').textContent = 'Устройство готово к прошивке';
            
            // Переходим к шагу 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        }
    } catch (error) {
        updateStatus(`Ошибка: ${error.message}`, 'error');
    }
}

// Функции для Serial монитора
async function connectSerial() {
    const uploader = new ESP32WebSerialUploader();
    const baudRate = document.getElementById('baudRate').value;
    uploader.baudRate = baudRate;
    
    const connected = await uploader.connect();
    if (connected) {
        updateStatus(`Serial подключен (${baudRate} baud)`, 'success');
        
        // Читаем вывод
        const outputElement = document.getElementById('serialOutput');
        outputElement.innerHTML = '<div class="serial-message">Подключено к ESP32...</div>';
        
        uploader.readSerialOutput((text) => {
            const message = document.createElement('div');
            message.className = 'serial-line';
            message.textContent = text;
            outputElement.appendChild(message);
            outputElement.scrollTop = outputElement.scrollHeight;
        });
        
        window.serialConnection = uploader;
    }
}

async function sendSerial() {
    if (!window.serialConnection) {
        updateStatus('Сначала подключитесь к Serial', 'warning');
        return;
    }
    
    const inputElement = document.getElementById('serialInput');
    const command = inputElement.value + '\r\n';
    
    try {
        await window.serialConnection.sendCommand(command);
        
        // Показываем отправленную команду
        const outputElement = document.getElementById('serialOutput');
        const sentMessage = document.createElement('div');
        sentMessage.className = 'serial-line sent';
        sentMessage.textContent = '> ' + inputElement.value;
        outputElement.appendChild(sentMessage);
        
        inputElement.value = '';
        outputElement.scrollTop = outputElement.scrollHeight;
    } catch (error) {
        updateStatus(`Ошибка отправки: ${error.message}`, 'error');
    }
}

function clearSerial() {
    document.getElementById('serialOutput').innerHTML = 
        '<div class="welcome-message">' +
        '<i class="fas fa-info-circle"></i>' +
        '<p>Подключитесь к ESP32 для просмотра вывода Serial</p>' +
        '</div>';
}
