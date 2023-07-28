import puppeteer from "puppeteer";
import cron from "node-cron";

function obtenerHoraActual() {
    const fechaActual = new Date();
    return fechaActual.getHours() * 3600 + fechaActual.getMinutes() * 60 + fechaActual.getSeconds();
}
  
  function obtenerHoraObjetivo(horaObjetivo) {
    const [horas, minutos] = horaObjetivo.split(":").map(Number);
    return horas * 3600 + minutos * 60;
}

async function rent() {
    const url = "http://oelectronica.doshermanas.net/cgi-bin/inFini"
    const username = "28937";
    const password = "OEFran23.."
    const horaAlquiler = "9:00"
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 15,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    //Va a la página principal del patronato
    await page.goto(url);

    //Clica en el botón de usuario y login
    await page.waitForSelector("button#sidebarCollapse");
    await page.click("button#sidebarCollapse");
    await page.waitForXPath('//*[@id="login"]/a');
    (await page.$x('//*[@id="login"]/a'))[0].click();

    // Espera a que los campos de usuario y contraseña estén disponibles utilizando el atributo "name"
    await page.waitForSelector('input[name="UserName"]');
    await page.waitForSelector('input[name="Password"]');

    //Introduce usuario y contraseña
    await page.type('input[name="UserName"]', username);
    await page.type('input[name="Password"]', password);
    await page.waitForXPath('//*[@id="content-inFini"]/div/div/div/form/div/div[2]/button');
    (await page.$x('//*[@id="content-inFini"]/div/div/div/form/div/div[2]/button'))[0].click();

    //Volver a la página principal
    await page.waitForXPath('//*[@id="mainNav"]/li[2]/a');
    (await page.$x('//*[@id="mainNav"]/li[2]/a'))[0].click();

    //Acceder a reservas de instalaciones
    await page.waitForXPath('//*[@id="MC"]/div[2]/div/div/div/div[1]/div/div[2]/a/span/span/span/span[1]');
    (await page.$x('//*[@id="MC"]/div[2]/div/div/div/div[1]/div/div[2]/a/span/span/span/span[1]'))[0].click();

    //Despliega el listado instalaciones
    await page.waitForXPath('//*[@id="rsv-m-sticky"]/div[2]/div[2]/div[1]/div[2]/div/a');
    (await page.$x('//*[@id="rsv-m-sticky"]/div[2]/div[2]/div[1]/div[2]/div/a'))[0].click();
   
    // Espera hasta la hora objetivo utilizando setTimeout
    const horaObjetivoSegundos = obtenerHoraObjetivo(horaAlquiler);
    const tiempoRestante = horaObjetivoSegundos - obtenerHoraActual();
    await new Promise(resolve => setTimeout(resolve, tiempoRestante * 1000));

    //Selecciona la zona Ramón y Cajal
    await page.waitForXPath('//*[@id="2"]');
    (await page.$x('//*[@id="2"]'))[0].click();        

    //Seleccionar hora
    await page.waitForXPath('//*[@id="c31x006"]');
    (await page.$x('//*[@id="c31x006"]'))[0].click();
    
    //Realiza la reserva
    await page.waitForSelector("div.rsv-info-boton");
    await page.click("div.rsv-info-boton");

    //Pagar desde el monedero    
    await page.waitForXPath('//*[@id="rsv-container-recb"]/div/div/div[3]/div[2]/div/div[2]/form/div/div[2]');
    (await page.$x('//*[@id="rsv-container-recb"]/div/div/div[3]/div[2]/div/div[2]/form/div/div[2]'))[0].click();

    //Crea la captura de pantalla del alquiler de la instalación
    await new Promise(r => setTimeout(r, 3000));await page.screenshot({path: "alquiler.png"});
    await browser.close(); 
}

//"59 8 * * 1": Ejecuta a las 8:59 todos los lunes.
cron.schedule("59 8 * * 1", rent);

