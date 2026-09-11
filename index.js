const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, service: "WePlay UID Lookup" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    if (!/^\d{5,}$/.test(String(uid || "").trim())) {
      return res.status(400).json({ error: "Invalid UID" });
    }

    const cleanUid = String(uid).trim();

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 900 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto("https://weplayapp.com/recharge", {
      waitUntil: "domcontentloaded",
      timeout: 40000,
    });

    await page.waitForSelector("input:not([type='hidden'])", { timeout: 40000 });

    const input = await page.$("input:not([type='hidden'])");
    await input.click();
    await input.evaluate(el => { el.value = ""; });
    await input.type(cleanUid);

    const submit = await page.waitForXPath("//div[contains(@class,'submit')]");
    await submit.click();

    await page.waitForFunction(() => {
      const els = document.querySelectorAll(
        "div"
      );
      return Array.from(els).some(el => el.textContent && el.textContent.trim().length > 0);
    }, { timeout: 40000 });

    // Same result locations used by the working Selenium version.
    const result = await page.evaluate(() => {
      const nicknameEl = document.evaluate(
        "/html/body/div[1]/div[2]/div[2]/div/div[2]/div/div[1]",
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      const charmEl = document.evaluate(
        "/html/body/div[1]/div[2]/div[2]/div/div[2]/div/div[2]",
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      ).singleNodeValue;

      const avatarEl = document.querySelector("img.avatar") ||
        Array.from(document.images).find(img =>
          (img.src || "").includes("weplayapp.com")
        );

      return {
        nickname: nicknameEl ? nicknameEl.textContent.trim() : "",
        charm: charmEl ? charmEl.textContent.trim() : "",
        avatar: avatarEl ? avatarEl.src : ""
      };
    });

    await browser.close();

    if (!result.nickname && !result.charm && !result.avatar) {
      return res.status(404).json({
        error: "UID result not found. WePlay may have changed the page structure."
      });
    }

    return res.status(200).json({
      uid: cleanUid,
      ...result
    });
  } catch (err) {
    return res.status(500).json({
      error: err && err.message ? err.message : String(err)
    });
  }
};
