# UGC Studio

Personal AI-powered User-Generated Content (UGC) video production studio.

## Features

- **AI Script & Hook Studio**: Generate viral hooks, problem-solution narrative, and CTA with Google Gemini, OpenAI, or built-in offline templates.
- **In-Browser Recording & Teleprompter**: Camera & audio device selection, live VU audio level meter, floating adjustable teleprompter with auto-scroll, and multi-take recording per scene.
- **9:16 Canvas Editor**: Real-time vertical smartphone preview (1080x1920 ratio), sequence playback across scenes, customizable viral text banners, subtitles, and audio controls.
- **Server-Side FFmpeg Engine**: Automatic video normalization, scene concatenation, and export to 1080x1920 MP4 ready for TikTok, Instagram Reels, and YouTube Shorts.
- **Self-Hostable & VPS Ready**: Single-command Docker deployment with persistent SQLite database and disk volumes.

## Getting Started Locally

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize SQLite database:
   ```bash
   npx prisma db push
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## VPS Deployment

### Option A: Docker Compose (Recommended)

1. Clone repository on your VPS:
   ```bash
   git clone <repo-url> ugc-studio
   cd ugc-studio
   ```

2. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

### Option B: Node.js & PM2

1. Install system FFmpeg:
   ```bash
   sudo apt update && sudo apt install -y ffmpeg
   ```

2. Install dependencies & build:
   ```bash
   npm install
   npx prisma db push
   npm run build
   ```

3. Start with PM2:
   ```bash
   pm2 start npm --name "ugc-studio" -- start
   pm2 save
   ```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Video Engine**: fluent-ffmpeg with @ffmpeg-installer/ffmpeg
- **AI Integration**: Multi-provider (Google Gemini, OpenAI, Edge-TTS)
