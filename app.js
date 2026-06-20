import fs from 'fs';

async function capturarFlujoOculto() {
    console.log("🚀 Iniciando extracción en segundo plano en los servidores de GitHub...");

    const { default: puppeteer } = await import('puppeteer');

    // Dejamos que Puppeteer administre de forma automática su propio ejecutable de Chrome
    const browser = await puppeteer.launch({
        headless: true, 
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    let enlaceDetectado = null;

    // Escuchador de red inteligente
    page.on('response', async (response) => {
        try {
            const url = response.url();

            if (url.includes('.m3u8') && url.includes('telemundo-4k') && !url.includes('findleembeds')) {
                if (url !== enlaceDetectado) {
                    enlaceDetectado = url;
                    
                    console.log("\n=================================================================");
                    console.log("🎯 ¡ENLACE M3U8 CAPTURADO DESDE GITHUB! 🎯");
                    console.log("=================================================================");
                    console.log(enlaceDetectado);
                    console.log("=================================================================\n");
                    
                    // Formato IPTV estándar
                    const contenidoM3U = `#EXTM3U\n#EXTINF:-1 tvg-id="Telemundo" tvg-name="Telemundo 4K" tvg-logo="" group-title="Canales",Telemundo 4K\n${enlaceDetectado}\n`;
                    
                    fs.writeFileSync('lista.m3u8', contenidoM3U, 'utf8');
                    console.log("[💾] Archivo lista.m3u8 generado con éxito.");

                    await browser.close();
                    process.exit(0);
                }
            }
        } catch (e) {
            // Ignorar respuestas muertas
        }
    });

    try {
        const urlTuWeb = "https://crypton4k.rf.gd/t.html?i=1";
        console.log(`[+] Conectando a: ${urlTuWeb}`);
        
        // Esperamos a que la red se estabilice por completo en el servidor
        await page.goto(urlTuWeb, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("[+] Página cargada de forma virtual. Esperando inicialización del iframe...");
        await new Promise(resolve => setTimeout(resolve, 8000));

        console.log("[*] Forzando clic virtual en el centro del reproductor...");
        await page.mouse.click(640, 360);

        console.log("[*] Monitoreando tráfico de red entrante en el servidor...");
        await new Promise(resolve => setTimeout(resolve, 25000));

    } catch (err) {
        if (!enlaceDetectado) {
            console.error("[-] Error en la ejecución interna del navegador:", err.message);
            process.exit(1);
        }
    } finally {
        try { await browser.close(); } catch(e) {}
        console.log("[+] Proceso finalizado.");
    }
}

capturarFlujoOculto().catch(err => {
    console.error("Error crítico general:", err);
    process.exit(1);
});
