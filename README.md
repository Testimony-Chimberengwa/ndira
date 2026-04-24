# Ndira

Ndira is an AI farming assistant built with Next.js 14, TypeScript, and Tailwind CSS. It helps African smallholder farmers diagnose crop problems instantly using AI.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini API
- Framer Motion
- Vercel

## Run Locally

```bash
npm install
```

Create a `.env.local` file in the project root and add:

```bash
GEMINI_API_KEY=your_api_key_here
```

Then start the app:

```bash
npm run dev
```

## Deploy to Vercel

1. Connect the GitHub repository to Vercel.
2. Add `GEMINI_API_KEY` in the Vercel dashboard as an environment variable.
3. Deploy the project.
