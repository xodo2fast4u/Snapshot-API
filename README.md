# Snapshot API

<div align="center">
  
<p align="center">
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Compat-Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Compatible">
  </a>
  <a href="https://pptr.dev">
    <img src="https://img.shields.io/badge/Automation-Puppeteer-2E8B57?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer">
  </a>
  <a href="LICENSE"> <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="MIT License"> </a>
  <a href="https://render.com">
    <img src="https://img.shields.io/badge/Hosted_on-Render-764ABC?style=for-the-badge&logo=render&logoColor=white" alt="Hosted on Render">
  </a>
</p>

</div>

Snapshot API is a simple, fast, and reliable service to generate **full-page PNG screenshots** of any live website.  
It uses a headless browser environment to ensure **pixel-perfect rendering** of complex, JavaScript-driven pages.

## Preview 
![Snapshot API Screenshot](https://files.catbox.moe/r4ab7x.webp)

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

## Author
Developed by [xodobyte](https://github.com/xodo2fast4u)
