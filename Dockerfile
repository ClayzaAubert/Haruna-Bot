FROM node:22-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      build-essential \
      python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src/ ./src/
COPY .env.example ./.env

RUN mkdir -p data sessions logs && \
    chown -R node:node /app

USER node

ENV NODE_ENV=production \
    LOG_LEVEL=info

VOLUME ["/app/data", "/app/sessions", "/app/logs"]

CMD ["node", "src/index.js"]
