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
                <div class="project-item">
                    <div class="project-main" onclick="loadProjectFromServer('${project.id}')">
                        <div class="project-name">${project.name}</div>
                        <div class="project-info">
                            <span><i class="far fa-calendar"></i> ${new Date(project.compiledAt).toLocaleDateString()}</span>
                            <span><i class="fas fa-weight-hanging"></i> ${Math.round((project.size || 0) / 1024)}KB</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="project-action-btn danger" title="Удалить проект" onclick="deleteProject('${project.id}', '${(project.name || '').replace(/'/g, '&apos;')}')">
                            <i class="fas fa-trash"></i>
                        </button>
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

async function deleteProject(projectId, projectName) {
    try {
        const safeName = (projectName || projectId).replace(/&apos;/g, "'");
        if (!confirm(`Удалить проект "${safeName}"?`)) return;

        const response = await fetch(`/api/project/${projectId}`, { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Не удалось удалить проект');
        }

        window.codeViewer.showNotification('Проект удален', 'success');
        loadProjects();
    } catch (error) {
        console.error('Ошибка удаления проекта:', error);
        window.codeViewer.showNotification(`Ошибка удаления: ${error.message}`, 'error');
    }
}

async function loadProjectFromServer(projectId) {
    try {
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();
        
        if (data.success) {
            // Загружаем блоки в workspace, если сохранено состояние
            if (data.project.blocklyState && window.workspace) {
                try {
                    window.workspace.clear();
                    Blockly.serialization.workspaces.load(data.project.blocklyState, window.workspace);
                    localStorage.setItem('blockly_workspace', JSON.stringify(data.project.blocklyState));
                    if (typeof generateCode === 'function') generateCode();
                    document.querySelector('[data-tab="blocks"]').click();
                } catch (e) {
                    console.warn('Не удалось загрузить состояние блоков, показываю код.', e);
                    window.codeViewer.setCode(data.project.code, 'cpp');
                    document.querySelector('[data-tab="code"]').click();
                }
            } else {
                // fallback: загружаем только код
                window.codeViewer.setCode(data.project.code, 'cpp');
                document.querySelector('[data-tab="code"]').click();
            }

            window.codeViewer.showNotification(`Проект "${projectId.substring(0, 8)}" загружен`, 'success');
        }
    } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
    }
}

// Загрузка примера
function loadExample() {
    if (!window.workspace) return;

    const exampleXml = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="esp32_structure" x="30" y="30">
    <statement name="SETUP">
      <block type="esp32_pin_mode">
        <field name="PIN">2</field>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="esp32_digital_write">
        <field name="PIN">2</field>
        <field name="STATE">HIGH</field>
        <next>
          <block type="esp32_delay">
            <value name="MS">
              <block type="math_number">
                <field name="NUM">1000</field>
              </block>
            </value>
            <next>
              <block type="esp32_digital_write">
                <field name="PIN">2</field>
                <field name="STATE">LOW</field>
                <next>
                  <block type="esp32_delay">
                    <value name="MS">
                      <block type="math_number">
                        <field name="NUM">1000</field>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

    const xmlDom = Blockly.utils.xml.textToDom(exampleXml);
    window.workspace.clear();
    Blockly.Xml.domToWorkspace(xmlDom, window.workspace);

    if (typeof generateCode === 'function') generateCode();
    window.codeViewer.showNotification('Пример "Мигающий светодиод" загружен в блоки', 'success');
    document.querySelector('[data-tab="blocks"]').click();
}

async function saveCurrentProject() {
    try {
        if (!window.workspace) return;
        const code = typeof generateCode === 'function' ? generateCode() : window.codeViewer.getCode();
        const blocklyState = Blockly.serialization.workspaces.save(window.workspace);
        const name = prompt('Название проекта:', 'Мой проект') || 'Мой проект';

        const response = await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                code,
                blocklyState,
                options: {
                    board: document.getElementById('esp32Board')?.value || 'esp32dev'
                }
            })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Ошибка сохранения проекта');
        }

        window.codeViewer.showNotification('Проект сохранен', 'success');
        if (typeof loadProjects === 'function') loadProjects();
    } catch (error) {
        console.error('Ошибка сохранения проекта:', error);
        updateStatus(`Ошибка сохранения: ${error.message}`, 'error');
    }
}

function exportCurrentProject() {
    try {
        if (!window.workspace) return;

        const code = typeof generateCode === 'function' ? generateCode() : window.codeViewer.getCode();
        const blocklyState = Blockly.serialization.workspaces.save(window.workspace);
        const projectData = {
            format: 'esp32-blockly-project-v1',
            exportedAt: new Date().toISOString(),
            name: 'Локальный проект',
            options: {
                board: document.getElementById('esp32Board')?.value || 'esp32dev',
                delay: Number(document.getElementById('loopDelay')?.value || 10)
            },
            code,
            blocklyState
        };

        const fileName = `esp32_project_${Date.now()}.json`;
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        window.codeViewer.showNotification(`Проект сохранен в файл ${fileName}`, 'success');
    } catch (error) {
        console.error('Ошибка локального экспорта проекта:', error);
        window.codeViewer.showNotification(`Ошибка экспорта: ${error.message}`, 'error');
    }
}

function openImportProjectDialog() {
    const input = document.getElementById('projectFileInput');
    if (!input) return;
    input.value = '';
    input.click();
}

async function importProjectFromFile(event) {
    try {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const project = JSON.parse(text);

        if (!project || !project.code) {
            throw new Error('Некорректный файл проекта');
        }

        if (window.workspace && project.blocklyState) {
            window.workspace.clear();
            Blockly.serialization.workspaces.load(project.blocklyState, window.workspace);
            localStorage.setItem('blockly_workspace', JSON.stringify(project.blocklyState));
            if (typeof generateCode === 'function') generateCode();
            document.querySelector('[data-tab="blocks"]')?.click();
        } else {
            window.codeViewer.setCode(project.code, 'cpp');
            document.querySelector('[data-tab="code"]')?.click();
        }

        if (project.options?.board) {
            const boardSelect = document.getElementById('esp32Board');
            if (boardSelect) boardSelect.value = project.options.board;
        }
        if (typeof project.options?.delay !== 'undefined') {
            const delayInput = document.getElementById('loopDelay');
            if (delayInput) delayInput.value = String(project.options.delay);
        }

        window.codeViewer.showNotification('Проект загружен с компьютера', 'success');
    } catch (error) {
        console.error('Ошибка импорта проекта:', error);
        window.codeViewer.showNotification(`Ошибка загрузки файла: ${error.message}`, 'error');
    }
}

function downloadCompiledFirmware() {
    try {
        if (!window.compiledBinary) {
            window.codeViewer.showNotification('Сначала выполните компиляцию', 'warning');
            return;
        }

        const binary = atob(window.compiledBinary);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const projectId = window.lastCompiledProjectId || 'esp32';
        a.href = url;
        a.download = `firmware_${projectId}.bin`;
        a.click();
        URL.revokeObjectURL(url);

        window.codeViewer.showNotification('Прошивка сохранена на компьютер', 'success');
    } catch (error) {
        console.error('Ошибка сохранения прошивки:', error);
        window.codeViewer.showNotification(`Ошибка сохранения прошивки: ${error.message}`, 'error');
    }
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
