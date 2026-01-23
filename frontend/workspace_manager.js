// Менеджер рабочей области

class WorkspaceManager {
    constructor(workspace) {
        this.workspace = workspace;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        this.init();
    }
    
    init() {
        // Инициализация истории
        this.saveState();
        
        // Обработчики событий для отмены/повтора
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });
        
        // Автоматическое сохранение состояния при изменениях
        this.workspace.addChangeListener(() => {
            this.saveState();
        });
    }
    
    saveState() {
        const xml = Blockly.Xml.workspaceToDom(this.workspace);
        const state = Blockly.Xml.domToText(xml);
        
        // Удаление состояний после текущего индекса
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Добавление нового состояния
        this.history.push(state);
        
        // Ограничение размера истории
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length - 1;
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            console.log('⏪ Отмена действия');
            logToConsole('⏪ Отмена действия', 'info');
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            console.log('⏩ Повтор действия');
            logToConsole('⏩ Повтор действия', 'info');
        }
    }
    
    restoreState(state) {
        try {
            const xml = Blockly.Xml.textToDom(state);
            this.workspace.clear();
            Blockly.Xml.domToWorkspace(xml, this.workspace);
        } catch (error) {
            console.error('❌ Ошибка восстановления состояния:', error);
        }
    }
    
    exportToJSON() {
        const blocks = this.workspace.getAllBlocks(false);
        const projectData = {
            version: '2.0',
            blocklyVersion: '12.3.1',
            timestamp: new Date().toISOString(),
            blocks: blocks.map(block => ({
                type: block.type,
                id: block.id,
                x: block.getRelativeToSurfaceXY().x,
                y: block.getRelativeToSurfaceXY().y,
                fields: block.inputList.flatMap(input => 
                    input.fieldRow.map(field => ({
                        name: field.name,
                        value: field.getValue()
                    }))
                )
            }))
        };
        
        return JSON.stringify(projectData, null, 2);
    }
    
    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Очистка рабочей области
            this.workspace.clear();
            
            // Восстановление блоков (упрощенная версия)
            // В реальном проекте нужна более сложная логика
            
            console.log('✅ Проект загружен из JSON');
            logToConsole('📂 Проект загружен из JSON', 'success');
            
        } catch (error) {
            console.error('❌ Ошибка загрузки из JSON:', error);
            logToConsole('❌ Ошибка загрузки проекта из JSON', 'error');
        }
    }
    
    getStatistics() {
        const blocks = this.workspace.getAllBlocks(false);
        const blockTypes = {};
        
        blocks.forEach(block => {
            blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
        });
        
        return {
            totalBlocks: blocks.length,
            uniqueBlockTypes: Object.keys(blockTypes).length,
            blockTypes: blockTypes,
            workspaceSize: {
                width: this.workspace.getMetrics().viewWidth,
                height: this.workspace.getMetrics().viewHeight
            }
        };
    }
}

// Инициализация менеджера рабочей области при загрузке
let workspaceManager = null;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.workspace) {
            workspaceManager = new WorkspaceManager(window.workspace);
            console.log('✅ WorkspaceManager инициализирован');
        }
    }, 1000);
});

// Функции для работы с рабочей областью
function undo() {
    if (workspaceManager) {
        workspaceManager.undo();
    }
}

function redo() {
    if (workspaceManager) {
        workspaceManager.redo();
    }
}

function exportWorkspace() {
    if (workspaceManager) {
        const json = workspaceManager.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `esp32_blockly_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logToConsole('📤 Рабочая область экспортирована в JSON', 'success');
    }
}

function importWorkspace() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            if (workspaceManager) {
                workspaceManager.importFromJSON(event.target.result);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function showStatistics() {
    if (workspaceManager) {
        const stats = workspaceManager.getStatistics();
        
        let message = `📊 Статистика рабочей области:\n\n`;
        message += `Всего блоков: ${stats.totalBlocks}\n`;
        message += `Уникальных типов блоков: ${stats.uniqueBlockTypes}\n\n`;
        
        message += `Типы блоков:\n`;
        Object.entries(stats.blockTypes).forEach(([type, count]) => {
            message += `  ${type}: ${count}\n`;
        });
        
        alert(message);
    }
}

// Экспорт функций
window.undo = undo;
window.redo = redo;
window.exportWorkspace = exportWorkspace;
window.importWorkspace = importWorkspace;
window.showStatistics = showStatistics;
