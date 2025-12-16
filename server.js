const http = require("http");
const { URL } = require("url");
const puppeteer = require("puppeteer");

const API_ROUTE_PATH = "/api/ss";
const PORT = 3000;

const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }
    return parsedUrl;
  } catch (err) {
    return null;
  }
};

const takeScreenshot = async (targetUrl) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
    });

    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
    });
    return await page.screenshot({
      type: "png",
      fullPage: true,
    });
  } catch (error) {
    console.error("Failed to take screenshot:", error);
    throw new Error("Screenshot failed");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && requestUrl.pathname === API_ROUTE_PATH) {
    const targetUrl = requestUrl.searchParams.get("url");

    if (!targetUrl || !isValidUrl(targetUrl)) {
      res.writeHead(400, {
        "Content-Type": "text/plain",
      });
      res.end('Error: Invalid or missing "url" query parameter.');
      return;
    }

    console.log(`Received request for screenshot of: ${targetUrl}`);

    try {
      const screenshotBuffer = await takeScreenshot(targetUrl);
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": screenshotBuffer.length,
        "Content-Disposition": `inline; filename="screenshot.png"`,
      });

      res.end(screenshotBuffer);
      console.log("Screenshot successfully sent.");
    } catch (error) {
      res.writeHead(500, {
        "Content-Type": "text/plain",
      });
      res.end("Internal Server Error: Could not capture screenshot.");
    }
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Snapshot API</title>
          <style>
            :root {
              --text-primary: oklch(0.96 0 264);
              --text-halfmute: oklch(0.94 0 264);
              --text-muted: oklch(0.74 0 264);
              
              --bg: oklch(0.1 0 264);
              --card-bg: oklch(0.2 0 264);
              --code-bg: oklch(0.3 0 264);
              --accent: oklch(0.96 0 264);

              --shadow-s: inset 0 1px 3px #ffffff30, 0 1px 2px #00000030, 0 2px 3px #00000020;
              --shadow-m: inset 0 1px 2px #ffffff50, 0 2px 4px #00000030, 0 4px 8px #00000015;
              --shadow-l: inset 0 1px 2px #ffffff70, 0 4px 6px #00000030, 0 6px 10px #00000015;
            }

            body {
              font-family: 'Segoe UI', 'Roboto', sans-serif;
              background-color: var(--bg);
              color: var(--text-primary);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              overflow-y: hidden;
            }

            .container {
              max-width: 700px;
              width: 100%;
              padding: 30px;
              margin: 50px auto 0;
              border-radius: 12px;
              background-color: var(--card-bg);
              box-shadow: var(--shadow-m); 
            }
            
            h1 {
              color: var(--accent);
              font-size: 2.5em;
              margin-bottom: 0.2em;
              border-bottom: 2px solid var(--code-bg);
              padding-bottom: 10px;
            }

            p {
              color: var(--text-halfmute);
              font-size: 1.1em;
              line-height: 1.6;
              margin-top: 1.5em;
            }

            .creator {
              font-style: italic;
              color: var(--text-muted);
              margin-top: 0.5em;
              margin-bottom: 2em;
            }

            .creator a {
              color: var(--text-primary);
              text-decoration: none;
            }

            code {
              background: var(--code-bg);
              color: var(--text-primary);
              padding: 8px 12px;
              border-radius: 6px;
              font-family: 'Fira Code', 'Cascadia Mono', monospace;
              font-size: 0.95em;
              white-space: nowrap;
              overflow-x: auto;
              display: block;
              margin-top: 10px;
              box-shadow: var(--shadow-s); 
            }

            .placeholder {
                color: var(--accent); 
                font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Snapshot API</h1>
            <p class="creator">
              Developed by <a href="https://github.com/xodo2fast4u" target="_blank">xodobyte</a>
            </p>
            
            <p>
              <strong>Instantly generate full-page, high-fidelity PNG screenshots</strong> of any live URL. 
              This service uses a headless browser environment to ensure 
              <strong>100% accurate rendering</strong> of complex, JavaScript-driven web pages, 
              cutting your content creation time from minutes to milliseconds.
            </p>
            
            <h3>How to Capture a Snapshot:</h3>
            <p>Simply pass the target URL to the following API endpoint:</p>
            
            <p>Endpoint Structure:</p>
            <code>/api/ss?url=<span class="placeholder">&lt;website_url&gt;</span></code>

            <p>Example Usage (Get an instant visual asset):</p>
            <code>/api/ss?url=https://google.com</code>
          </div>
        </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

