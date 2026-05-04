# Changelog

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
