FROM node:20-bullseye-slim

# Install system dependencies including FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma Client and build Next.js application
RUN npx prisma generate
RUN npm run build

# Expose Next.js server port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Startup command (runs prisma db push if db not initialized then starts server)
CMD ["sh", "-c", "npx prisma db push && npm run start"]
