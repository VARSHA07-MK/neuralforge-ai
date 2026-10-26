<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head><title>About — NeuralForge AI</title></svelte:head>

<div class="nf-container wrap">
	<h1>About NeuralForge AI</h1>
	<p class="intro">
		NeuralForge AI is an interactive laboratory for understanding how modern AI systems actually
		work — not as a chatbot, but as a developer tool you can inspect, step through, and learn from.
	</p>

	<div class="cards">
		<div class="nf-card">
			<h2>What it covers</h2>
			<ul>
				<li><strong>Transformer internals</strong> — tokens, embeddings, attention, next-token prediction, on a real in-browser GPT-2.</li>
				<li><strong>The Model Context Protocol</strong> — how a host, client, server, and tools exchange typed messages.</li>
				<li><strong>Multi-agent orchestration</strong> — planning, dependencies, retries, and failure handling.</li>
				<li><strong>Observability</strong> — one unified, typed execution trace across all of the above.</li>
			</ul>
		</div>

		<div class="nf-card">
			<h2>How it's built</h2>
			<p>
				A fully static SvelteKit + TypeScript app. The simulation engines (MCP, agents, trace) are
				pure, deterministic TypeScript with no DOM dependencies, which keeps them unit-testable and
				keeps each lab independently usable.
			</p>
			<p class="stack">
				SvelteKit 2 · Svelte 5 · TypeScript · Vite 7 · onnxruntime-web · D3 · GSAP · Vitest
			</p>
		</div>
	</div>

	<div class="nf-card note">
		<h2>Simulation vs. real execution</h2>
		<p>
			The Transformer Lab runs a <strong>real</strong> GPT-2 model via <code>onnxruntime-web</code>.
			The MCP and Agent labs are <strong>deterministic simulations</strong> built for learning — every
			event is labelled <code>simulated</code>, and no real network connection, server, or external
			model is involved. A visualization of MCP is not itself an MCP server.
		</p>
	</div>

	<p class="repo">
		Source code:
		<a href="https://github.com/VARSHA07-MK/neuralforge-ai" target="_blank" rel="noopener noreferrer"
			>github.com/VARSHA07-MK/neuralforge-ai</a
		>
	</p>

	<a class="nf-btn primary" href={`${base}/`}>← Back to Overview</a>
</div>

<style lang="scss">
	.wrap {
		padding: 40px 20px 60px;
	}
	h1 {
		font-size: 30px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.intro {
		margin-top: 10px;
		max-width: 72ch;
		color: var(--nf-muted);
		font-size: 15px;
		line-height: 1.6;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
		margin-top: 24px;
	}
	.nf-card h2 {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--nf-faint);
		margin-bottom: 12px;
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	li {
		color: var(--nf-muted);
		font-size: 14px;
		line-height: 1.5;
	}
	li strong,
	.note strong {
		color: var(--nf-text);
	}
	.nf-card p {
		color: var(--nf-muted);
		font-size: 14px;
		line-height: 1.6;
	}
	.nf-card p + p {
		margin-top: 10px;
	}
	.stack {
		font-family: var(--nf-mono);
		font-size: 12.5px;
		color: var(--nf-faint) !important;
	}
	.note {
		margin-top: 16px;
		border-left: 3px solid var(--nf-cyan);
	}
	.note code {
		font-family: var(--nf-mono);
		color: var(--nf-cyan);
		font-size: 12.5px;
	}
	.repo {
		margin: 22px 0;
		color: var(--nf-muted);
		font-size: 14px;
	}
	.repo a {
		color: var(--nf-violet-2);
	}
</style>
