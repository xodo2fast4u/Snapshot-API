import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer';

const API_ROUTE_PATH = '/api/ss';
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const isValidUrl = (url: string): URL | null => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }
    return parsedUrl;
  } catch (err) {
    return null;
  }
};

const takeScreenshot = async (targetUrl: string): Promise<Buffer> => {
  let browser: Browser | undefined;
  try {
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

    if (!executablePath) {
      const possiblePaths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/brave-browser',
        '/snap/brave/current/usr/bin/brave',
        '/usr/bin/microsoft-edge',
        '/usr/bin/microsoft-edge-stable',
        '/usr/bin/vivaldi',
        '/usr/bin/firefox',
      ];

      for (const browserPath of possiblePaths) {
        if (fs.existsSync(browserPath)) {
          executablePath = browserPath;
          console.log(`Found browser at: ${executablePath}`);
          break;
        }
      }

      if (!executablePath) {
        try {
          executablePath = puppeteer.executablePath();
          console.log(`Using Puppeteer's default path: ${executablePath}`);
        } catch (error) {
          throw new Error('No browser found. Install Chrome, Brave, Edge or run: bun run chrome');
        }
      }
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--single-process',
        '--no-zygote',
      ],
      executablePath,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
    });

    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    return (await page.screenshot({
      type: 'png',
      fullPage: true,
    })) as Buffer;
  } catch (error) {
    console.error('Failed to take screenshot for:', targetUrl, 'Error:', (error as Error).message);
    throw new Error('SCREENSHOT_FAILED');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url as string, `http://${req.headers.host}`);

  if (req.method === 'GET' && requestUrl.pathname === API_ROUTE_PATH) {
    const targetUrl = requestUrl.searchParams.get('url');

    if (!targetUrl || !isValidUrl(targetUrl)) {
      res.writeHead(400, {
        'Content-Type': 'text/plain',
      });
      res.end(
        'Error: Invalid or missing "url" query parameter. Example: /api/ss?url=https://example.com',
      );
      return;
    }

    console.log(`Received request for screenshot of: ${targetUrl}`);

    try {
      const screenshotBuffer = await takeScreenshot(targetUrl);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length,
        'Content-Disposition': `inline; filename="screenshot-${new Date().getTime()}.png"`,
      });

      res.end(screenshotBuffer);
      console.log('Screenshot successfully sent for:', targetUrl);
    } catch (error) {
      console.error(
        `Error processing screenshot request for ${targetUrl}:`,
        (error as Error).message,
      );

      let statusCode = 500;
      let errorMessage = 'Internal Server Error: Could not capture screenshot.';

      if ((error as Error).message === 'SCREENSHOT_FAILED') {
        errorMessage = 'Screenshot failed, check if the target URL is accessible and valid.';
      }

      res.writeHead(statusCode, {
        'Content-Type': 'text/plain',
      });
      res.end(errorMessage);
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/') {
    const indexPath = path.join(PUBLIC_DIR, 'static', 'index.html');
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'text/html',
      });
      res.end(content);
    } catch (error) {
      console.error('Error reading index.html:', error);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Error loading index page');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/style.css') {
    const cssPath = path.join(PUBLIC_DIR, 'styling', 'style.css');
    try {
      const content = fs.readFileSync(cssPath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'text/css',
      });
      res.end(content);
    } catch (error) {
      console.error('Error reading style.css:', error);
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('CSS file not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/404.css') {
    const cssPath = path.join(PUBLIC_DIR, 'styling', '404.css');
    try {
      const content = fs.readFileSync(cssPath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'text/css',
      });
      res.end(content);
    } catch (error) {
      console.error('Error reading 404.css:', error);
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('CSS file not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/site.webmanifest') {
    const manifestPath = path.join(PUBLIC_DIR, 'assets', 'site.webmanifest');
    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'application/manifest+json',
      });
      res.end(content);
    } catch (error) {
      console.error('Error reading site.webmanifest:', error);
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Manifest not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/favicon.ico') {
    const faviconPath = path.join(PUBLIC_DIR, 'assets', 'favicon.ico');
    try {
      const content = fs.readFileSync(faviconPath);
      res.writeHead(200, {
        'Content-Type': 'image/x-icon',
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Favicon not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/apple-touch-icon.png') {
    const iconPath = path.join(PUBLIC_DIR, 'assets', 'apple-touch-icon.png');
    try {
      const content = fs.readFileSync(iconPath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Icon not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/android-chrome-192x192.png') {
    const iconPath = path.join(PUBLIC_DIR, 'assets', 'android-chrome-192x192.png');
    try {
      const content = fs.readFileSync(iconPath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Icon not found');
    }
  } else if (req.method === 'GET' && requestUrl.pathname === '/android-chrome-512x512.png') {
    const iconPath = path.join(PUBLIC_DIR, 'assets', 'android-chrome-512x512.png');
    try {
      const content = fs.readFileSync(iconPath);
      res.writeHead(200, {
        'Content-Type': 'image/png',
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('Icon not found');
    }
  } else {
    const notFoundPath = path.join(PUBLIC_DIR, 'static', '404.html');
    try {
      const content = fs.readFileSync(notFoundPath, 'utf-8');
      res.writeHead(404, {
        'Content-Type': 'text/html',
      });
      res.end(content);
    } catch (error) {
      console.error('Error reading 404.html:', error);
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      res.end('404 Not Found: Use /api/ss?url=<website_url> to capture a screenshot.');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
