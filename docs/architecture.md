# NeuralForge AI — Architecture

> Working document. Started from an audit of the upstream
> [Transformer Explainer](https://github.com/poloclub/transformer-explainer)
> (MIT, © Polo Club of Data Science) and extended into an interactive AI
> systems laboratory.

## 1. Audit of the original repository (baseline)

| Aspect | Finding |
| --- | --- |
| Framework | **SvelteKit 2.53** + **Svelte 5.53** (runes-capable), TypeScript |
| Build | **Vite** + `@sveltejs/adapter-static` (`output → build/`), fully prerendered |
| Routing | Single route `/` (the transformer visualization) |
| Visualization | D3 + `d3-sankey`, GSAP animation, KaTeX for math, custom SVG/Canvas |
| Model | Real **GPT-2** inference in-browser via `onnxruntime-web`; weights shipped as 63 chunks under `static/model-v2/` and reassembled at runtime (`src/utils/fetchChunks.js`) |
| Tokenizer | `@xenova/transformers` (`Xenova/gpt2`) |
| State | Svelte stores in `src/store/index.ts` |
| Styling | Tailwind + SCSS, `~` alias → `src` |
| Deploy | `gh-pages`, base path `/transformer-explainer` in production |
| License | MIT (retained) |

### Baseline fixes applied
The upstream `package.json` was partially upgraded: Svelte/Kit/`vite-plugin-svelte@6`
were bumped but `vite` stayed pinned at `^5`, which the plugin rejects. Two changes
restore a green build:

1. `vite` → `^7` (matches `@sveltejs/vite-plugin-svelte@6`'s `^6 || ^7` peer range).
2. `vite.config.ts`: add the project root to Sass `loadPaths` so
   `@import 'src/styles/variables.scss'` resolves under Vite 7's stricter resolver.

`npm install --legacy-peer-deps && npm run build` now succeeds.

## 2. Target product — five modules + one platform

| Module | Route | Nature |
| --- | --- | --- |
| Transformer Lab | `/transformer` | **Preserved** upstream visualization (real GPT-2) |
| MCP Lab | `/mcp` | **New** — deterministic Model Context Protocol simulator |
| Agent Lab | `/agents` | **New** — deterministic multi-agent workflow engine |
| Trace Studio | `/trace` | **New** — unified, typed event timeline across modules |
| Learning Center | `/learn` | **New** — contextual explanations + knowledge checks |
| Overview / About | `/`, `/about` | **New** — landing + attribution |

## 3. Code boundaries (enforced)

```
src/lib/neuralforge/
  types.ts            Shared typed contracts (TraceEvent, MCP, agents, tasks)
  trace/              Run/event recorder — the spine all modules emit into
  mcp/                MCP simulation engine (tools, server, client, lifecycle)
  agents/             Deterministic workflow engine (scheduler, retries, cancel)
  data/               Local sample datasets (e.g. sales.ts)
  scenario/           "From Prompt to Verified Result" guided scenario
  learn/              Learning-center content + glossary (data, not UI)
```

**Rule:** engines are pure TypeScript with **no Svelte/DOM imports**. UI components
subscribe to engine output. This keeps the simulation deterministic and unit-testable,
and keeps each lab independently usable even if another fails.

## 4. Honesty / provenance

Every `TraceEvent` carries `provenance: 'simulated' | 'real'`. Simulated LLM
interpretation, MCP messages, and agent runs are **always** labelled simulated.
Only the Transformer Lab (real `onnxruntime-web` GPT-2) and any measured timing
emit `real`. No fabricated attention matrices, probabilities, or timing are ever
presented as genuine measurements. A visualization of MCP is not an MCP server.

## 5. Status

- [x] Phase 1 — Audit + baseline green build + GitHub repo
- [ ] Phase 2 — Identity + navigation shell + route restructure
- [ ] Phase 3 — Transformer Lab integrated into shell
- [ ] Phase 4 — MCP Lab (engine ✅ in progress, UI pending)
- [ ] Phase 5 — Agent Lab
- [ ] Phase 6 — Trace Studio
- [ ] Phase 7 — Guided scenario
- [ ] Phase 8 — Learning Center
- [ ] Phase 9 — Tests + typecheck + build
- [ ] Phase 10 — Docs + attribution + GitHub Pages deploy
