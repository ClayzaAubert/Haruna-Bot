FROM node:22-slim

# Install ffmpeg untuk sticker command
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files dulu (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src/ ./src/
COPY .env.example .env.example

# Buat direktori data dan logs
RUN mkdir -p data sessions logs

# Non-root user untuk security
RUN useradd -r -u 1001 botuser && \
    chown -R botuser:botuser /app
USER botuser

ENV NODE_ENV=production
ENV AUTH_BACKEND=sqlite

EXPOSE 3000

# Health check — cek apakah proses masih jalan
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

CMD ["node", "src/app.js"]
