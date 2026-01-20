const workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});

async function compileAndFlash() {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    
    // 1. Отправка на компиляцию
    const response = await fetch('http://localhost:3000/compile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ code })
    });
    const blob = await response.blob();

    // 2. Прошивка через Web Serial
    const port = await navigator.serial.requestPort();
    const transport = new esptooljs.Transport(port);
    const esploader = new esptooljs.ESPLoader(transport, 115200);
    await esploader.main_fn();
    
    await esploader.write_flash({
        fileArray: [{ data: await blob.arrayBuffer(), address: 0x0 }],
        flash_size: 'keep'
    });
    alert("Прошивка завершена!");
}
