# Ndira

Ndira is an AI-assisted farming companion built with Next.js 14, TypeScript, and Tailwind CSS.
It helps farmers describe crop symptoms in plain language and receive diagnosis insights with treatment steps.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Gemini SDK (`@google/generative-ai`)
- Vercel Analytics (`@vercel/analytics`)
- Framer Motion
- React Hook Form
- Axios
- Lucide React icons

## Project Setup Used

The app was scaffolded with:

```bash
npx create-next-app@latest ndira --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Then dependencies were added:

```bash
npm install @google/generative-ai @vercel/analytics lucide-react framer-motion react-hook-form axios
```

## Folder Structure

```text
src/
  app/
    api/
      diagnose/
        route.ts
    dashboard/
      page.tsx
    layout.tsx
    page.tsx
  components/
    ui/
      GlassCard.tsx
      GaugeChart.tsx
      TreatmentCard.tsx
      WeatherStrip.tsx
      VoiceInput.tsx
      NavBar.tsx
    ChatInput.tsx
    DiagnosisHero.tsx
  lib/
    gemini.ts
    types.ts
  styles/
    globals.css
```

## Configuration Highlights

- Tailwind theme extended with:
  - `primary: #2E7D32`
  - `amber: #F9A825`
  - `cream: #FFF8E7`
  - `sage: #E8F5E9`
- `darkMode` disabled (`false`)
- Body background gradient:
  - `linear-gradient(160deg, #E8F5E9 0%, #FFF8E7 100%)`

## Environment Variables

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

If `GEMINI_API_KEY` is not set, the API route uses a safe fallback diagnosis response.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Endpoint

### POST `/api/diagnose`

Request:

```json
{
  "message": "My maize leaves are turning yellow and curling."
}
```

Response shape:

```json
{
  "diagnosis": "...",
  "confidence": 78,
  "riskLevel": "medium",
  "treatment": [
    { "title": "...", "details": "..." }
  ]
}
```

## Pages

- `/` Home intake page with hero, chat input, weather strip, and bottom navigation
- `/dashboard` Diagnosis summary with gauge and treatment cards

## Deployment

Recommended deployment target: Vercel.

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add `GEMINI_API_KEY` in Vercel environment settings.
4. Deploy.

## Notes

- This is the first project prompt implementation and can be extended in the next prompt.
- Initial UI direction references the provided design zip while keeping a clean Next.js component architecture.
