<script lang="ts">
	import { base } from '$app/paths';

	const modules = [
		{
			href: '/transformer',
			name: 'Transformer Lab',
			status: 'live',
			blurb:
				'A real GPT-2 model running in your browser. Watch tokenization, attention, the MLP, and next-token probabilities update as you type.'
		},
		{
			href: '/mcp',
			name: 'MCP Lab',
			status: 'live',
			blurb:
				'Step through the Model Context Protocol: inspect tools and their schemas, invoke them, and watch a request travel host → client → server → tool.'
		},
		{
			href: '/agents',
			name: 'Agent Lab',
			status: 'soon',
			blurb:
				'A multi-agent workflow engine with task dependencies, parallel execution, retries, timeouts, and cancellation.'
		},
		{
			href: '/trace',
			name: 'Trace Studio',
			status: 'soon',
			blurb:
				'One typed, timestamped timeline that links transformer, MCP, and agent activity for a single run — with payload inspection and JSON export.'
		},
		{
			href: '/learn',
			name: 'Learning Center',
			status: 'soon',
			blurb:
				'Concise, accurate explanations of transformers, attention, MCP, agent orchestration, and execution tracing.'
		}
	];
</script>

<svelte:head>
	<title>NeuralForge AI — Interactive AI Systems Laboratory</title>
</svelte:head>

<section class="hero nf-container">
	<span class="nf-chip">Interactive AI systems laboratory</span>
	<h1>
		Understand the Intelligence.<br />
		Trace the Execution. <span class="grad">Engineer the Future.</span>
	</h1>
	<p class="lede">
		NeuralForge AI is a developer-grade lab for modern AI systems. See how a transformer turns text
		into predictions, how applications talk to tools through the <strong>Model Context Protocol</strong>,
		and how multiple agents collaborate — connected by one unified execution trace.
	</p>
	<div class="cta">
		<a class="nf-btn primary" href={`${base}/transformer`}>Explore the Transformer Lab</a>
		<a class="nf-btn" href={`${base}/mcp`}>Open the MCP Lab</a>
	</div>

	<div class="note">
		<strong>Simulation vs. real.</strong> The Transformer Lab runs a <em>real</em> GPT-2 model. The
		MCP and Agent labs are <em>deterministic simulations</em> for learning — every event is labelled
		<code>simulated</code>, with no real network or server involved.
	</div>
</section>

<section class="grid nf-container">
	{#each modules as m}
		<a class="nf-card module" href={`${base}${m.href}`}>
			<div class="top">
				<h3>{m.name}</h3>
				<span class="badge" class:live={m.status === 'live'}>
					{m.status === 'live' ? 'Live' : 'Soon'}
				</span>
			</div>
			<p>{m.blurb}</p>
			<span class="go">Open {m.name} →</span>
		</a>
	{/each}
</section>

<footer class="foot nf-container">
	Built with SvelteKit · Svelte 5 · TypeScript · onnxruntime-web · D3 · Vitest
</footer>

<style lang="scss">
	.hero {
		padding: 72px 20px 40px;
		text-align: center;
	}
	.hero h1 {
		margin: 20px auto 0;
		font-size: clamp(30px, 5vw, 50px);
		line-height: 1.08;
		font-weight: 800;
		letter-spacing: -0.02em;
		max-width: 16ch;
	}
	.grad {
		background: linear-gradient(90deg, var(--nf-violet-2), var(--nf-cyan));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.lede {
		margin: 20px auto 0;
		max-width: 62ch;
		color: var(--nf-muted);
		font-size: 17px;
		line-height: 1.6;
	}
	.lede strong {
		color: var(--nf-text);
	}
	.cta {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 28px;
	}
	.note {
		margin: 34px auto 0;
		max-width: 60ch;
		padding: 12px 16px;
		border: 1px solid var(--nf-border);
		border-left: 3px solid var(--nf-cyan);
		border-radius: 8px;
		background: var(--nf-surface);
		color: var(--nf-muted);
		font-size: 13.5px;
		line-height: 1.55;
		text-align: left;
	}
	.note code {
		font-family: var(--nf-mono);
		color: var(--nf-cyan);
		font-size: 12.5px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
		padding: 24px 20px 10px;
	}
	.module {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s, transform 0.08s;
	}
	.module:hover {
		border-color: var(--nf-violet);
		transform: translateY(-2px);
	}
	.module .top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.module h3 {
		font-size: 17px;
		font-weight: 700;
	}
	.badge {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid var(--nf-border-2);
		color: var(--nf-faint);
	}
	.badge.live {
		color: var(--nf-green);
		border-color: rgba(52, 211, 153, 0.4);
		background: rgba(52, 211, 153, 0.08);
	}
	.module p {
		margin-top: 10px;
		color: var(--nf-muted);
		font-size: 14px;
		line-height: 1.55;
		flex: 1;
	}
	.module .go {
		margin-top: 14px;
		color: var(--nf-violet-2);
		font-size: 13.5px;
		font-weight: 500;
	}
	.foot {
		padding: 30px 20px 50px;
		color: var(--nf-faint);
		font-size: 13px;
		text-align: center;
	}
</style>
