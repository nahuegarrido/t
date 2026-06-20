import fs from 'fs';

async function capturarFlujoOculto() {
    console.log("🚀 Iniciando extracción en segundo plano en los servidores de GitHub...");

    const { default: puppeteer } = await import('puppeteer');

    // Lanzamos el navegador optimizado para entornos Linux de servidor (GitHub)
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
                    
                    // Creamos el contenido del archivo en formato IPTV M3U clásico
                    const contenidoM3U = `#EXTM3U\n#EXTINF:-1 tvg-id="Telemundo" tvg-name="Telemundo 4K" tvg-logo="" group-title="Canales",Telemundo 4K\n${enlaceDetectado}\n`;
                    
                    // Guardamos el archivo de forma local en el servidor de GitHub
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
        console.log(`[+] Cargando: ${urlTuWeb}`);
        
        await page.goto(urlTuWeb, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 7000));

        // Forzamos el clic en el reproductor virtual
        await page.mouse.click(640, 360);

        // Esperamos un tiempo prudencial en el servidor
        await new Promise(resolve => setTimeout(resolve, 25000));

    } catch (err) {
        if (!enlaceDetectado) {
            console.error("[-] El tiempo de espera terminó sin capturas:", err.message);
            process.exit(1);
        }
    } finally {
        try { await browser.close(); } catch(e) {}
        console.log("[+] Proceso finalizado.");
    }
}

capturarFlujoOculto().catch(err => {
    console.error("Error general:", err);
    process.exit(1);
});
