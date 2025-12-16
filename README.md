# Snapshot API

![Node.js](https://img.shields.io/badge/node-%3E%3D18-green?style=flat)
![puppeteer](https://img.shields.io/badge/puppeteer-latest-blue?style=flat)
![license](https://img.shields.io/badge/license-ISC-lightgrey?style=flat)
![render](https://img.shields.io/badge/hosted%20on-Render-purple?style=flat)

Snapshot API is a simple, fast, and reliable service to generate **full-page PNG screenshots** of any live website.  
It uses a headless browser environment to ensure **pixel-perfect rendering** of complex, JavaScript-driven pages.

## Features
- Full-page, high-fidelity screenshots
- Accurate rendering of modern web apps
- Lightweight Node.js server with Puppeteer
- Hosted on Render for easy deployment

## Usage
Send a GET request to the API endpoint with a target URL:

```/api/ss?url=<website_url>```

### Example

```/api/ss?url=https://google.com```

The response will be a PNG image of the requested page.

## Deployment
This project is hosted on Render.

## Author
Developed by [xodobyte](https://github.com/xodo2fast4u)
