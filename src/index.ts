import * as puppeteer from "puppeteer"

async function main() {
    while(true){
        await getRouterIdAddress();
    }
}

async function getRouterIdAddress() {
    let browser = await puppeteer.launch({
        headless: false
    });

    let page = await browser.newPage();
    let url = "http://192.168.1.1"

    await page.goto(url);
    //make sure whether a controller loaded
    let defaultTimeoutInMilliseconds = 5000;
    let passwordTextField = await page.waitForSelector(
        "input[type='password'][id='pcPassword']",
        { visible: true, timeout: defaultTimeoutInMilliseconds }
    );
    await passwordTextField.type("admin");

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
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e);
    } finally {
    }
})();