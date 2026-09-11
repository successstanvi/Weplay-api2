# WePlay UID Lookup — Vercel Ready

This version does NOT use Selenium/ChromeDriver on the Vercel Python runtime.

It uses:
- Node.js serverless function
- `puppeteer-core`
- `@sparticuz/chromium` (serverless Chromium)

## Deploy

1. Upload this folder/repository to GitHub.
2. Import the repo into Vercel.
3. Deploy with the default Node.js settings.
4. Open the deployed URL.

No ChromeDriver installation and no Termux browser path are required.

## API

POST `/api`

JSON:
{"uid":"439058824"}

Response:
{"uid":"439058824","nickname":"...","charm":"...","avatar":"..."}

## If it fails

If WePlay changes its HTML/XPath selectors, edit the selectors in `api/index.js`.
The current selectors are converted from the working Selenium script supplied for this project.
# website
# website
