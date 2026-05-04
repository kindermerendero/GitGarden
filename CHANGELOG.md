# Changelog

## [2026-05-04] — Final touches: Rare Blooms, Growth Animation, Ground Detail, RPG Tooltips, Sound

**Rare Blooms**
- `plantMapper.ts`: campo `legendary: boolean` — true se >1000 righe o commit più antico di un batch ≥25
- `sprites.ts`: aggiunto sprite 9×9 ornato (index 6), riservato ai legendary; costanti `LEGENDARY_SPRITE_IDX` e `REGULAR_SPRITE_COUNT`
- Legendary plants: sprite speciale + super-glow triplo (3 drop-shadow) + 4 pixel orbit animati in loop (rotate 360°, 5s)
- svg/route.ts: aggiornato per usare legendary sprite nella generazione SVG

**Growth Animation**
- Stelo e fiore separati in due `motion.svg` con animazioni indipendenti
- Stelo: `scaleY: 0→1` da `bottom center`, ease lineare, 0.55s
- Fiore: `scale: 0→1, rotate: -100°→0°` con `type: "spring", stiffness: 260, damping: 12`, delay 0.48s
- `transformOrigin` calibrato sul punto di giunzione stelo-fiore

**Ground Detail**
- `Garden.tsx`: SVG decorativo sopra l'erba con 55 elementi deterministici — ciuffi d'erba (2px verticali) e sassi (pixel grigio)
- `Plant.tsx`: div glow colorato in basso a ogni pianta (`radial-gradient + blur`) proietta luce sulla terra

**RPG Tooltips**
- `lore.ts`: 15 frasi generate da sentiment, linesChanged, keywords nel messaggio
- `PixelTooltip`: bordo pixel-art 2px, titolo in Geist, lore in *Instrument Serif* italic, stats +/− con badge ★ legendary
- Animazione `scale: 0.96→1` + `y: 6→0` su hover

**Sound**
- Web Audio API: `AudioContext` condiviso a livello modulo, oscillatore square-wave 720Hz→200Hz in 70ms
- `onAnimationComplete` sul fiore SVG → `playPop()`, gain 0.045, 8-bit pop feel

## [2026-05-04] — Fix audit: qualità codice, robustezza, DX

- **sprites.ts**: SPRITES, CENTERS, GRASS, DIRT, shadowColor, highlightColor centralizzati in un'unica source of truth (erano duplicati in Plant.tsx e svg/route.ts)
- **plantMapper.ts**: rimosso campo `petalCount` (mai usato); rimosso "refactor" da POSITIVE_KEYWORDS (ora in NEGATIVE); fix edge case array vuoto
- **Plant.tsx**: rimossa prop `index` (dead dopo stagger refactor); import da sprites.ts
- **Garden.tsx**: import GRASS/DIRT da sprites.ts; rimosso parametro `i` inutilizzato in plants.map
- **github.ts**: timeout 12s con AbortController; messaggi d'errore tradotti e user-friendly per 401, 404, 429, timeout
- **commits/route.ts**: validazione con regex `^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$` (chiude bypass "a/" e "/b")
- **garden/svg/route.ts**: stessa validazione regex; import da sprites.ts; usa shadowColor/highlightColor invece di darken()
- **page.tsx**: cache session-level `Map<string, PlantData[]>` — stesso repo non ri-fetcha
- **layout.tsx**: Open Graph e Twitter Card metadata
- **error.tsx**: nuovo error boundary con UI coerente

## [2026-05-04] — Deep visual restyling (4 pilastri)

**Pillar 1 — Grain & Texture**
- Rimosso `body::before` da globals.css
- Nuovo componente `GrainOverlay` con SVG `feTurbulence` (fractalNoise, 4 octaves) montato in layout.tsx, opacity 0.052

**Pillar 2 — Micro-interazioni organiche**
- Garden: `staggerChildren: 0.07s` su motion.div container — piante appaiono in sequenza
- Plant: animazione wind loop infinita (rotate [-amp, +amp]) con wrapper separato dal grow
- Ampiezza e durata del vento dipendono da `linesChanged`: 0.9°/5.2s (basso) → 2.0°/2.6s (>300 linee)
- Fase deterministica da `sha.charCodeAt(2)` per desincronizzare le oscillazioni

**Pillar 3 — Hue Shifting**
- `shadowColor()`: shift verso blu-viola (freddo) + darken
- `highlightColor()`: shift verso giallo-crema (caldo) + lighten
- Palette formalizzata: 12 colori signature (4 per famiglia × 3 sentiment)
- Shadow e highlight usati rispettivamente per offset layer e pixel 2×2 in alto a sinistra

**Pillar 4 — Visual SFX**
- Bloom: CSS `drop-shadow` vibrante applicato al wind wrapper per commit con >300 linee
- Pixel Dust: 5 particelle quadrate (3–4px) si alzano dalla testa del fiore e svaniscono in 0.85s al mount

## [2026-05-04] — Export to README (SVG dinamico)

- Nuova route `GET /api/garden/svg?repo=owner/repo` — genera SVG pixel-art completo server-side
- Stessa logica sprite di Plant.tsx (6 template, PX=6, shadow, highlight, foglie diagonali)
- Terreno Minecraft (erba + dirt) incluso nell'SVG
- Glow radiale atmosferico con gradient SVG, colore segue il day/night cycle
- Header: `Content-Type: image/svg+xml`, `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`
- Parametro opzionale `?hour=N` per forzare la fascia oraria
- Watermark "GitGarden" in basso a destra in Georgia serif
- Nuovo componente `ShareSection` — preview SVG + campo markdown + copy button con feedback animato
- `ShareSection` appare sotto il giardino dopo la generazione, con delay 2.4s

## [2026-05-04] — Day/Night mode organica basata sull'ora locale

- Aggiunto `src/lib/timeTheme.ts` — 7 fasce orarie (night, dawn, morning, midday, afternoon, dusk, evening) con colori `bg` e `glow` distinti
- `globals.css`: sfondo e glow centralizzati in CSS variables (`--garden-bg`, `--garden-glow`), `transition: background-color 3s ease` su body
- `page.tsx`: hook che legge l'ora al mount e aggiorna le variabili ogni minuto via `setProperty`
- Glow radiale ora usa `var(--garden-glow)` — shift da verde (giorno) a blu (notte) a arancio (alba) a viola (tramonto)
- Piccolo indicatore del periodo corrente in basso a destra (es. "dusk")

## [2026-05-04] — Inizializzazione vault Obsidian

- Creata pagina `~/Vault/Progetti/Personal/GitGarden.md` con stack, concept, architettura e TODO
- Aggiornato `~/Vault/index.md` sezione Personal
- Appesa entry INGEST in `~/Vault/log.md`

## [2026-05-04] — Pixel art aesthetic (Pokémon/Minecraft style)

- Plant.tsx: sostituiti bezier SVG con sprite rettangolari su griglia 6px (`shapeRendering="crispEdges"`, `imageRendering="pixelated"`)
- 6 template sprite (3×3, 5×5, 7×7) selezionati deterministicamente da SHA del commit
- Ombre pixel-art: shadow layer offset 1px, highlight 2×2 bianco sul centro
- Foglie: pixel diagonali (2 blocchi) invece di ellissi curve
- Garden.tsx: terreno in stile Minecraft — riga erba verde + 2 righe dirt marrone, SVG pixel-art con pattern deterministico
- Legenda: pixel quadrati 6×6 invece di cerchi CSS
- Tooltip: bordo rettangolare sharp (2px solid) invece di rounded-xl

## [2026-05-04] — Audit estetico completo

- Font: sostituiti Geist Sans/Mono con Instrument Serif (display italico) + Fira Code (mono) + Geist (body)
- Sfondo: da `#0d0d1a` (freddo/viola) a `#0b0d09` (caldo/foresta) + radial glow verde-scuro sotto il giardino
- Grain texture portata al 5.5% (da 3% invisibile) via `body::before`
- Piante: petali refactored da `<ellipse>` a bezier path organico (teardrop shape)
- Piante: aggiunta doppia foglia bezier (sinistra + destra), bloom glow su hover, colori centro sentiment-aware
- Tooltip: riscritto con `AnimatePresence` + state React invece di CSS-only hover (fix posizionamento, aggiunto +/- lines)
- Input: rimosso rounded-xl e bg, solo border-bottom centrata — più editoriale
- Bottone: rimosso border/bg, solo testo mono `generate garden →`
- Ground line: da `via-white/10` a gradiente verde-tinted con shadow soil
- Stats: feature/fix separati con colori, legend spostata sotto le stats, dimensioni ridotte
- Empty state: opacità piante da 10% a 22%, testo da white/15 a white/28

## [2026-05-04] — Setup iniziale + MVP garden

- Inizializzato progetto Next.js 16 con TypeScript, Tailwind v4, App Router
- Installato Framer Motion e Octokit
- Implementato `GET /api/commits?repo=owner/repo` con Octokit (ultimi 30 commit, stats additions/deletions)
- Logica di mapping commit → pianta: altezza stelo da linee cambiate, colore da sentiment keyword
- Componenti SVG animati con Framer Motion: stelo, foglie, petali, centro fiore
- Dashboard con input owner/repo, stato loading, gestione errori, placeholder garden
- Tooltip su hover con messaggio, autore, linee cambiate, sentiment
- Legenda colori + stats aggregate (commit totali, linee totali, fiori verdi)
- Estetica dark minimalista, palette coerente
