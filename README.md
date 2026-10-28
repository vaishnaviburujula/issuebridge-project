# IssueBridge

IssueBridge helps beginners discover public GitHub issues, understand the problem in plain language, and follow a checklist to make their first open-source contribution.

## Features
- Search and filter public GitHub issues
- Beginner-friendly issue summaries and suggested next steps
- Contribution checklist with browser-local progress
- Saved issues
- Sample issue fallback if GitHub is unavailable
- Responsive React interface

## Run locally
Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for deployment
```bash
npm run build
npm run preview
```

## Deploy
Import the GitHub repository into Vercel or Netlify. Use:
- Build command: `npm run build`
- Output directory: `dist`

## Data and limitations
Live issue data is fetched from GitHub's public REST API. If the request fails or rate limits are reached, the app shows clearly labelled sample issues. The explanation panel uses rule-based heuristics; it does not call an AI model and should be treated as a starting point, not authoritative technical guidance.

## Suggested team contributions
1. Dashboard, integration and demo
2. Issue discovery, search and filters
3. Explanation panel and roadmap
4. QA, README, saved issues and deployment

## Open-source contribution note
For a real Hacktoberfest contribution, choose a repository whose contribution guidelines allow it, read its `CONTRIBUTING.md`, and submit a useful, non-trivial change. Do not create low-quality or unnecessary pull requests just to claim participation.