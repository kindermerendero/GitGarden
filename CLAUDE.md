# GitGarden

Web app che trasforma i commit di un repo GitHub in un giardino digitale generativo.

## Stack
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — animazioni grow delle piante
- **Octokit** — GitHub REST API

## Struttura
```
src/
  app/
    page.tsx              — pagina principale (client component)
    layout.tsx
    globals.css
    api/
      commits/route.ts    — GET /api/commits?repo=owner/repo
  lib/
    github.ts             — fetchCommits() con Octokit
    plantMapper.ts        — mapCommitsToPlants(), sentiment analysis
  components/
    Plant.tsx             — SVG animato (stelo + petali + tooltip)
    Garden.tsx            — griglia di piante + stats
    SearchForm.tsx        — input owner/repo + bottone
```

## Logica mapping commit → pianta
- **Altezza stelo** = linee cambiate (additions + deletions), normalizzate 40–140px
- **Colore** = sentiment del commit message:
  - Verde/teal = keyword positive (feat, add, improve, refactor...)
  - Rosa/viola = keyword negative (fix, bug, hotfix, revert...)
  - Sabbia/neutro = nessuna keyword forte
- **Numero petali** = 4–7 (determinato dal primo char dello SHA)

## Comandi
```bash
npm run dev     # dev server su :3000
npm run build   # build produzione
npm run lint    # eslint
```

## Env
```
GITHUB_TOKEN=   # opzionale, aumenta rate limit da 60 a 5000 req/h
```

## Note operative
- `npm install --legacy-peer-deps` — peer deps di Framer Motion / React 19
- Il token GitHub è opzionale per repo pubblici ma consigliato in sviluppo
