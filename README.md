# Ndira

Ndira is an AI farming assistant built with Next.js 14, TypeScript, and Tailwind CSS. It helps African smallholder farmers diagnose crop problems instantly using OpenRouter-powered AI.

## What It Can Do

- Diagnose crop disease from text and uploaded crop photos.
- Auto-detect farmer location and use it in advice.
- Show in-app agricultural news feed (not only external links).
- Build a weather intelligence dashboard from multiple free sources.
- Generate farm planning illustrations and redesign ideas from a prompt or uploaded farm photo.
- Display graph views for weather risk, news source mix, and farm budget split.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenRouter API
- Framer Motion
- Vercel

## Run Locally

```bash
npm install
```

Create a `.env.local` file in the project root and add:

```bash
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=google/gemma-4-31b-it:free
OPENROUTER_VISION_MODEL=google/gemini-2.5-flash
OPENROUTER_IMAGE_MODEL=google/gemini-2.5-flash-image
```

Then start the app:

```bash
npm run dev
```

## Deploy to Vercel

1. Connect the GitHub repository to Vercel.
2. Add `OPENROUTER_API_KEY` in the Vercel dashboard as an environment variable.
3. Add `OPENROUTER_MODEL`, `OPENROUTER_VISION_MODEL`, and `OPENROUTER_IMAGE_MODEL` to tune diagnosis/image generation models.
4. Deploy the project.
