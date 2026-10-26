# NeuralForge AI

**Understand the Intelligence. Trace the Execution. Engineer the Future.**

NeuralForge AI is an interactive educational and engineering laboratory for modern
AI systems. It visualizes how transformer-based language models process text, how AI
applications communicate with tools through the **Model Context Protocol (MCP)**, and
how multiple AI agents collaborate to complete a task — all connected by a single
unified execution trace.

It is designed to feel like a sophisticated developer tool, not a chatbot or a
generic AI landing page.

## Modules

- **Transformer Lab** — a live GPT-2 model running entirely in your browser. Type your
  own text and watch tokenization, embeddings, multi-head self-attention, the MLP, and
  next-token probabilities update in real time.
- **MCP Lab** — a deterministic Model Context Protocol simulator. Inspect sample tools
  and their JSON-Schema inputs, invoke them, and watch a request travel
  `user → host → MCP client → MCP server → tool → result`, including controlled failure
  scenarios: invalid arguments, permission denied, timeout, and tool error.
- **Agent Lab** — a multi-agent workflow simulator with task dependencies, parallel
  execution, retries, timeouts, cancellation, and failure injection. *(in progress)*
- **Trace Studio** — one typed, timestamped timeline that links transformer, MCP, and
  agent activity for a single run, with filtering, payload inspection, and JSON export.
  *(in progress)*
- **Learning Center** — concise, technically accurate explanations of each concept,
  with contextual tooltips and knowledge checks. *(in progress)*

> ### Simulation vs. real execution
> The **Transformer Lab runs a real GPT-2 model** via `onnxruntime-web`. The **MCP and
> Agent labs are deterministic simulations** built for learning — every event is
> labelled `simulated`, and no real network connection, server, or external model is
> involved. A visualization of MCP is not itself an MCP server.

## Tech stack

SvelteKit 2 · Svelte 5 · TypeScript · Vite 7 · D3 / d3-sankey · GSAP · KaTeX ·
onnxruntime-web · @xenova/transformers · Tailwind CSS · Vitest

## Getting started

**Prerequisites:** Node.js 20+ and npm 10+.

```bash
git clone https://github.com/VARSHA07-MK/neuralforge-ai.git
cd neuralforge-ai
npm install --legacy-peer-deps
npm run dev
```

Then open **http://localhost:5173** in your browser.

> `--legacy-peer-deps` is required because the Svelte toolchain and Vite 7 have an
> overlapping peer-dependency range that npm's strict resolver rejects.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server at `http://localhost:5173` |
| `npm run build` | Produce the static production build in `build/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest suite (engine/unit tests) |
| `npm run check` | Type-check with `svelte-check` |
| `npm run lint` | Prettier + ESLint checks |

## Testing

Simulation engines (MCP, agents, trace) are pure, deterministic TypeScript with no DOM
dependencies, which makes them directly unit-testable:

```bash
npm test
```

The current suite covers the MCP request-path event sequence, all four failure modes,
run determinism, and the guided scenario's sample calculation.

## Deployment

The app is a fully static site (`@sveltejs/adapter-static`), output to `build/`. For
GitHub Pages the production base path is `/neuralforge-ai` (configured in
`svelte.config.js`). Build and deploy:

```bash
npm run build
# deploy the contents of build/ to your static host
```

## Project status

| Area | Status |
| --- | --- |
| Transformer Lab (real GPT-2) | ✅ Working |
| MCP simulation engine + tests | ✅ Done |
| MCP Lab UI | 🚧 In progress |
| Agent Lab, Trace Studio, Learning Center | 🚧 Planned |

See [`docs/architecture.md`](docs/architecture.md) for the full design and roadmap.

## Acknowledgements & license

NeuralForge AI is released under the MIT License (see [`LICENSE`](LICENSE)).

The in-browser transformer visualization is built on the open-source
**Transformer Explainer** by the Polo Club of Data Science, used under the MIT License.
NeuralForge AI extends it with original work: the MCP simulator, the multi-agent
workflow engine, the unified Trace Studio, and the guided scenario.
