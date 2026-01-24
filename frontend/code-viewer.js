// Менеджер просмотра и редактирования кода
class CodeViewer {
    constructor() {
        this.editor = null;
        this.currentLanguage = 'cpp';
        this.codeFormats = {
            cpp: 'C++',
            python: 'MicroPython',
            json: 'JSON'
        };
        this.initEditor();
    }

    initEditor() {
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs' }});
        
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('codeEditor'), {
                value: '// Код будет сгенерирован здесь\n',
                language: 'cpp',
                theme: 'vs-dark',
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                renderLineHighlight: 'all',
                lineNumbers: 'on',
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                glyphMargin: true,
                lightbulb: { enabled: true }
            });

            // Обновляем статистику при изменении
            this.editor.onDidChangeModelContent(() => {
                this.updateStats();
            });

            // Инициализируем статистику
            this.updateStats();
        });
    }

    setCode(code, language = 'cpp') {
        if (this.editor) {
            this.currentLanguage = language;
            monaco.editor.setModelLanguage(this.editor.getModel(), language);
            this.editor.setValue(code);
            this.updateStats();
            
            // Подсветка синтаксиса
            this.applySyntaxHighlighting();
        }
    }

    getCode() {
        return this.editor ? this.editor.getValue() : '';
    }

    updateStats() {
        if (!this.editor) return;
        
        const code = this.editor.getValue();
        const lines = code.split('\n').length;
        const chars = code.length;
        
        // Простая оценка сложности
        const complexity = this.calculateComplexity(code);
        
        document.getElementById('lineCount').textContent = `Строк: ${lines}`;
        document.getElementById('charCount').textContent = `Символов: ${chars}`;
        document.getElementById('complexity').textContent = `Сложность: ${complexity}`;
    }

    calculateComplexity(code) {
        const metrics = {
            loops: (code.match(/(for|while|do)\s*\(/g) || []).length,
            conditions: (code.match(/(if|else if|switch)\s*\(/g) || []).length,
            functions: (code.match(/void\s+\w+\s*\(|int\s+\w+\s*\(|bool\s+\w+\s*\(/g) || []).length,
            includes: (code.match(/#include/g) || []).length
        };

        const score = metrics.loops * 2 + metrics.conditions * 1.5 + metrics.functions * 3;
        
        if (score > 20) return 'Высокая';
        if (score > 10) return 'Средняя';
        return 'Низкая';
    }

    formatCode() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
            
            // Кастомное форматирование для C++
            if (this.currentLanguage === 'cpp') {
                const code = this.editor.getValue();
                const formatted = this.formatCpp(code);
                this.editor.setValue(formatted);
            }
        }
    }

    formatCpp(code) {
        // Простое форматирование C++ кода
        let formatted = code;
        
        // Добавляем пробелы вокруг операторов
        formatted = formatted.replace(/=([^=])/g, ' = $1');
        formatted = formatted.replace(/([^ ])=/g, '$1 = ');
        formatted = formatted.replace(/\+([^+])/g, ' + $1');
        formatted = formatted.replace(/([^ ])\+/g, '$1 + ');
        
        // Форматируем фигурные скобки
        formatted = formatted.replace(/\{\s*/g, ' {\n');
        formatted = formatted.replace(/;\s*/g, ';\n');
        
        // Добавляем отступы
        let lines = formatted.split('\n');
        let indent = 0;
        lines = lines.map(line => {
            line = line.trim();
            if (line.includes('}')) indent--;
            const indentedLine = ' '.repeat(indent * 4) + line;
            if (line.includes('{')) indent++;
            return indentedLine;
        });
        
        return lines.join('\n');
    }

    applySyntaxHighlighting() {
        // Monaco Editor автоматически применяет подсветку
        // Дополнительные правила можно добавить здесь
    }

    saveAsFile() {
        const code = this.getCode();
        const language = this.currentLanguage;
        const extension = this.getFileExtension(language);
        const filename = `esp32_code_${Date.now()}.${extension}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification(`Файл ${filename} сохранен`);
    }

    getFileExtension(language) {
        const extensions = {
            cpp: 'cpp',
            python: 'py',
            json: 'json',
            javascript: 'js',
            html: 'html',
            css: 'css'
        };
        return extensions[language] || 'txt';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    copyToClipboard() {
        const code = this.getCode();
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Код скопирован в буфер обмена', 'success');
        });
    }
}

// Глобальный экземпляр
window.codeViewer = new CodeViewer();

// Вспомогательные функции
function copyCode() {
    window.codeViewer.copyToClipboard();
}

function formatCode() {
    window.codeViewer.formatCode();
}

function saveCodeAsFile() {
    window.codeViewer.saveAsFile();
}

// Инициализация вкладок
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Обновляем активные кнопки
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Показываем соответствующий контент
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                    
                    // При переключении на вкладку кода обновляем редактор
                    if (tabId === 'code' && window.codeViewer.editor) {
                        setTimeout(() => window.codeViewer.editor.layout(), 100);
                    }
                }
            });
        });
    });
}

// Инициализация drag and drop
function initDragAndDrop() {
    const blockItems = document.querySelectorAll('.block-item');
    const workspace = document.getElementById('blocklyDiv');
    
    blockItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('block-type', item.getAttribute('data-type'));
            e.dataTransfer.setData('text/plain', item.textContent);
        });
    });
    
    workspace.addEventListener('dragover', (e) => {
        e.preventDefault();
        workspace.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
    });
    
    workspace.addEventListener('dragleave', () => {
        workspace.style.backgroundColor = '';
    });
    
    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        workspace.style.backgroundColor = '';
        
        const blockType = e.dataTransfer.getData('block-type');
        if (blockType && window.workspace) {
            // Создаем блок в месте дропа
            const xml = Blockly.utils.xml.createElement('xml');
            const block = Blockly.utils.xml.createElement('block');
            block.setAttribute('type', blockType);
            xml.appendChild(block);
            
            // Конвертируем координаты
            const rect = workspace.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            Blockly.Xml.domToWorkspace(xml, window.workspace);
            
            // Перемещаем блок в позицию дропа
            const newBlock = window.workspace.getTopBlocks()[0];
            if (newBlock) {
                newBlock.moveBy(x, y);
            }
        }
    });
}

// Загрузка списка проектов
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        const projectsList = document.getElementById('projectsList');
        if (data.success && data.projects.length > 0) {
            projectsList.innerHTML = data.projects.map(project => `
                <div class="project-item" onclick="loadProjectFromServer('${project.id}')">
                    <div class="project-name">${project.name}</div>
                    <div class="project-info">
                        <span><i class="far fa-calendar"></i> ${new Date(project.compiledAt).toLocaleDateString()}</span>
                        <span><i class="fas fa-weight-hanging"></i> ${Math.round(project.size / 1024)}KB</span>
                    </div>
                </div>
            `).join('');
        } else {
            projectsList.innerHTML = '<div class="empty-state">Нет сохраненных проектов</div>';
        }
    } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
    }
}

async function loadProjectFromServer(projectId) {
    try {
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();
        
        if (data.success) {
            // Загружаем код в редактор
            window.codeViewer.setCode(data.project.code, 'cpp');
            
            // Показываем уведомление
            window.codeViewer.showNotification(`Проект "${projectId.substring(0, 8)}" загружен`, 'success');
            
            // Переключаемся на вкладку кода
            document.querySelector('[data-tab="code"]').click();
        }
    } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
    }
}

// Загрузка примера
function loadExample() {
    const exampleCode = `// Пример: Мигающий светодиод
#include <Arduino.h>

// Определяем пин светодиода
const int LED_PIN = 2;

// Функция настройки блоков
void setup_blocks() {
    // Настраиваем пин как выход
    pinMode(LED_PIN, OUTPUT);
    
    // Выводим приветственное сообщение
    Serial.println("Blink example started!");
    Serial.println("LED pin: " + String(LED_PIN));
}

// Функция выполнения блоков
void loop_blocks() {
    // Включаем светодиод
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED ON");
    delay(1000);
    
    // Выключаем светодиод
    digitalWrite(LED_PIN, LOW);
    Serial.println("LED OFF");
    delay(1000);
}`;
    
    window.codeViewer.setCode(exampleCode, 'cpp');
    window.codeViewer.showNotification('Пример "Мигающий светодиод" загружен', 'success');
    document.querySelector('[data-tab="code"]').click();
}

// Обновление статуса
function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    const indicator = document.getElementById('statusIndicator');
    
    statusElement.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                         type === 'warning' ? 'exclamation-triangle' : 
                         type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Обновляем индикатор
    const dot = indicator.querySelector('.status-dot');
    dot.className = 'status-dot ' + type;
    indicator.querySelector('.status-text').textContent = 
        type === 'success' ? 'Готов' : 
        type === 'warning' ? 'Внимание' : 
        type === 'error' ? 'Ошибка' : 'Работает';
}

// Показ/скрытие модального окна
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Очистка рабочей области
function clearWorkspace() {
    if (window.workspace && confirm('Очистить всю рабочую область?')) {
        window.workspace.clear();
        updateStatus('Рабочая область очищена', 'info');
    }
}
