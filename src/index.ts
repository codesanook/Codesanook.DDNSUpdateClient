import * as puppeteer from "puppeteer"
import * as http from 'http';
import IConfiguration from './IConfiguration'

//create configuration.json in dist folder
const configuration: IConfiguration = require('./configuration.json')
const defaultTimeoutInMilliseconds:number = 5000;

async function main() {
    while (true) {
        let ipAddress = await getRouterIdAddress();
        let result = await updateNewIP(
            configuration.username,
            configuration.password,
            configuration.hostname,
            ipAddress
        );
        console.log(`result ${result}`);
        await sleep(1 * 60 * 1000);
    }
}

async function getRouterIdAddress(): Promise<string> {
    let browser = await puppeteer.launch({
        headless: true
    });

    let page = await browser.newPage();
    console.log(`configuration.routerIPAddress ${configuration.routerUrl}`)
    await page.goto(configuration.routerUrl);
    //make sure whether a controller loaded
    let passwordTextField = await page.waitForSelector(
        "input[type='password'][id='pcPassword']",
        { visible: true, timeout: defaultTimeoutInMilliseconds }
    );
    await passwordTextField.type(configuration.routerPassword);

    let loginButton = await page.$("button[id='login-btn']");
    await loginButton.click();

    let selector = "input[type='text'][id='internetIp']"
    let ipTextField = await page.waitForSelector(selector, { visible: true, timeout: defaultTimeoutInMilliseconds });
    await page.waitForFunction(
        selector => selector.value !== null && /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(selector.value),
        { timeout: defaultTimeoutInMilliseconds, polling: 500 },
        ipTextField
    );

    let ipAddress = await page.evaluate(ipTextField => ipTextField.value, ipTextField);
    console.log(`ipAddress ${ipAddress}`);

    await page.close();
    await browser.close();
    return ipAddress;
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function updateNewIP(username: string, password: string, hostname: string, ip: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let base64UsernamePassword = Buffer.from(`${username}:${password}`).toString('base64')
        const options = {
            port: 80,
            method: 'GET',
            path: `/nic/update?hostname=${hostname}&myip=${ip}`,
            hostname: 'dynupdate.no-ip.com',
            headers: {
                'Authorization': `Basic ${base64UsernamePassword}`,
                'User-Agent': 'CodeSanook.DDNSUpdateClient/v1.0.0 theeranitp@gmail.com'
            }
        };

        const request = http.request(options, (response) => {
            console.log('statusCode:', response.statusCode);
            let body = [];
            response.on('data', (data) => {
                body.push(data);
            });

            response.on('end', () => {
                let bodyContent: string;
                try {
                    bodyContent = Buffer.concat(body).toString();
                    console.log(`${hostname} updated`);
                    resolve(bodyContent);
                } catch (error) {
                    reject(error);
                }
            })
        });

        request.on('error', (error) => {
            console.error(error);
            reject(error);
        });

        request.end();
    });
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e);
    } finally {
    }
})();