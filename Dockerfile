FROM ghcr.io/puppeteer/puppeteer:23.10.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./

USER root
RUN npm ci
USER pptruser

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]