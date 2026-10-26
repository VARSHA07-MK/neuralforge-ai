<script lang="ts">
	import { SAMPLE_TOOLS } from '~/lib/neuralforge/mcp/tools';
	import { simulateMcpCall, type McpCallOutcome } from '~/lib/neuralforge/mcp/simulate';
	import type { McpFailureMode, TraceEvent } from '~/lib/neuralforge/types';

	const defaults: Record<string, Record<string, unknown>> = {
		sales_summary: { metric: 'total_revenue', group_by: 'region' },
		calculator: { a: 6, b: 7, op: 'multiply' },
		get_weather: { city: 'Bengaluru' }
	};

	const failureModes: { value: McpFailureMode; label: string }[] = [
		{ value: 'none', label: 'Success' },
		{ value: 'invalid-args', label: 'Invalid arguments' },
		{ value: 'denied', label: 'Permission denied' },
		{ value: 'timeout', label: 'Timeout' },
		{ value: 'tool-error', label: 'Tool error' }
	];

	let selected = SAMPLE_TOOLS[0].name;
	let failureMode: McpFailureMode = 'none';
	let argsText = JSON.stringify(defaults[selected], null, 2);
	let argsError = '';
	let outcome: McpCallOutcome | null = null;
	let openEvent: string | null = null;

	$: tool = SAMPLE_TOOLS.find((t) => t.name === selected)!;

	function selectTool(name: string) {
		selected = name;
		argsText = JSON.stringify(defaults[name] ?? {}, null, 2);
		argsError = '';
		outcome = null;
	}

	function run() {
		let args: Record<string, unknown> = {};
		try {
			args = JSON.parse(argsText);
			argsError = '';
		} catch {
			argsError = 'Arguments must be valid JSON.';
			return;
		}
		outcome = simulateMcpCall({ tool: selected, args, failureMode, runId: `mcp-${Date.now()}` });
		openEvent = null;
	}

	function pretty(v: unknown): string {
		return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
	}
	function statusClass(s: TraceEvent['status']): string {
		if (s === 'success') return 'nf-status-success';
		if (s === 'error') return 'nf-status-error';
		if (s === 'running') return 'nf-status-running';
		return '';
	}
</script>

<svelte:head><title>MCP Lab — NeuralForge AI</title></svelte:head>

<div class="nf-container page">
	<header class="head">
		<h1>MCP Lab</h1>
		<p>
			A deterministic simulation of the <strong>Model Context Protocol</strong>. Pick a tool, inspect
			its JSON-Schema input, optionally inject a failure, and watch the request travel
			<code>user → host → MCP client → MCP server → tool → result</code>. No real network or server
			is involved — every event is labelled <code>simulated</code>.
		</p>
	</header>

	<div class="layout">
		<!-- Controls -->
		<aside class="panel">
			<h2>Tools</h2>
			<div class="tools">
				{#each SAMPLE_TOOLS as t}
					<button class="tool" class:sel={t.name === selected} on:click={() => selectTool(t.name)}>
						<span class="tname">{t.title}</span>
						<span class="tdesc">{t.description}</span>
					</button>
				{/each}
			</div>

			<h2>Arguments</h2>
			<textarea class="args nf-code" bind:value={argsText} spellcheck="false" rows="6"></textarea>
			{#if argsError}<p class="err">{argsError}</p>{/if}

			<h2>Scenario</h2>
			<select class="sel-input" bind:value={failureMode}>
				{#each failureModes as f}<option value={f.value}>{f.label}</option>{/each}
			</select>

			<button class="nf-btn primary run" on:click={run}>Invoke tool →</button>
		</aside>

		<!-- Schema + results -->
		<main class="results">
			<section class="nf-card">
				<h2>Input schema <span class="muted">· {tool.name}</span></h2>
				<div class="schema">
					{#each Object.entries(tool.inputSchema.properties) as [key, prop]}
						<div class="row">
							<code class="k">{key}</code>
							<span class="ty">{prop.type}</span>
							{#if tool.inputSchema.required.includes(key)}<span class="req">required</span>{/if}
							<span class="desc">{prop.description}{prop.enum ? ` (${prop.enum.join(' | ')})` : ''}</span>
						</div>
					{/each}
				</div>
			</section>

			{#if outcome}
				<section class="nf-card">
					<h2>
						Protocol timeline
						<span class="verdict {outcome.ok ? 'nf-status-success' : 'nf-status-error'}">
							{outcome.ok ? '✓ success' : '✕ error'}
						</span>
					</h2>
					<ol class="timeline">
						{#each outcome.events as ev}
							<li>
								<button class="evt" on:click={() => (openEvent = openEvent === ev.id ? null : ev.id)}>
									<span class="comp">{ev.component}</span>
									<span class="type">{ev.type}</span>
									<span class="summary">{ev.summary}</span>
									<span class="meta">
										<span class={statusClass(ev.status)}>{ev.status}</span>
										{#if ev.duration}<span class="dur">{ev.duration}ms</span>{/if}
									</span>
								</button>
								{#if openEvent === ev.id}
									<div class="detail">
										<div class="kv"><span>t</span><code>+{ev.t}ms</code></div>
										<div class="kv"><span>provenance</span><code>{ev.provenance}</code></div>
										{#if ev.input !== undefined}
											<div class="blk"><span>input</span><pre class="nf-code">{pretty(ev.input)}</pre></div>
										{/if}
										{#if ev.output !== undefined}
											<div class="blk"><span>output</span><pre class="nf-code">{pretty(ev.output)}</pre></div>
										{/if}
										{#if ev.error}
											<div class="blk"><span>error</span><pre class="nf-code err">{pretty(ev.error)}</pre></div>
										{/if}
									</div>
								{/if}
							</li>
						{/each}
					</ol>
				</section>

				<section class="nf-card">
					<h2>JSON-RPC response</h2>
					<pre class="nf-code">{pretty(outcome.response)}</pre>
				</section>
			{:else}
				<section class="nf-card empty">
					Select a tool and press <strong>Invoke tool</strong> to see the protocol events.
				</section>
			{/if}
		</main>
	</div>
</div>

<style lang="scss">
	.page {
		padding: 28px 20px 60px;
	}
	.head h1 {
		font-size: 30px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.head p {
		margin-top: 10px;
		max-width: 80ch;
		color: var(--nf-muted);
		font-size: 14.5px;
		line-height: 1.6;
	}
	.head code,
	.head strong {
		color: var(--nf-text);
	}
	.head code {
		font-family: var(--nf-mono);
		font-size: 12.5px;
		color: var(--nf-cyan);
	}

	.layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 16px;
		margin-top: 22px;
	}
	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}

	.panel {
		background: var(--nf-surface);
		border: 1px solid var(--nf-border);
		border-radius: var(--nf-radius);
		padding: 16px;
		height: fit-content;
	}
	.panel h2,
	.results h2 {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--nf-faint);
		margin-bottom: 10px;
	}
	.panel h2:not(:first-child) {
		margin-top: 18px;
	}
	.tools {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.tool {
		text-align: left;
		padding: 10px;
		border-radius: 9px;
		border: 1px solid var(--nf-border);
		background: var(--nf-bg-2);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.tool:hover {
		border-color: var(--nf-border-2);
	}
	.tool.sel {
		border-color: var(--nf-violet);
		box-shadow: inset 0 0 0 1px var(--nf-violet);
	}
	.tname {
		color: var(--nf-text);
		font-size: 14px;
		font-weight: 600;
	}
	.tdesc {
		color: var(--nf-muted);
		font-size: 12px;
		line-height: 1.4;
	}
	.args {
		width: 100%;
		resize: vertical;
	}
	.err {
		color: var(--nf-red);
		font-size: 12px;
		margin-top: 6px;
	}
	.sel-input {
		width: 100%;
		padding: 9px 10px;
		border-radius: 9px;
		border: 1px solid var(--nf-border-2);
		background: var(--nf-bg-2);
		color: var(--nf-text);
		font-size: 14px;
	}
	.run {
		width: 100%;
		margin-top: 18px;
	}

	.results {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}
	.muted {
		color: var(--nf-faint);
		font-family: var(--nf-mono);
		text-transform: none;
		letter-spacing: 0;
	}
	.schema .row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 6px 0;
		border-bottom: 1px solid var(--nf-border);
		flex-wrap: wrap;
		font-size: 13px;
	}
	.schema .k {
		font-family: var(--nf-mono);
		color: var(--nf-violet-2);
	}
	.schema .ty {
		color: var(--nf-cyan);
		font-size: 12px;
	}
	.schema .req {
		font-size: 10.5px;
		color: var(--nf-amber);
		border: 1px solid rgba(251, 191, 36, 0.4);
		border-radius: 999px;
		padding: 0 6px;
	}
	.schema .desc {
		color: var(--nf-muted);
		flex: 1;
	}

	.verdict {
		font-size: 12px;
		margin-left: 8px;
		text-transform: none;
		letter-spacing: 0;
	}
	.timeline {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.evt {
		width: 100%;
		text-align: left;
		display: grid;
		grid-template-columns: 92px 120px 1fr auto;
		gap: 10px;
		align-items: center;
		padding: 9px 10px;
		border-radius: 8px;
		border: 1px solid var(--nf-border);
		background: var(--nf-bg-2);
		cursor: pointer;
		font-size: 12.5px;
	}
	.evt:hover {
		border-color: var(--nf-border-2);
	}
	.comp {
		font-family: var(--nf-mono);
		color: var(--nf-cyan);
		font-size: 11.5px;
	}
	.type {
		font-family: var(--nf-mono);
		color: var(--nf-violet-2);
		font-size: 11.5px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.summary {
		color: var(--nf-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		display: flex;
		gap: 8px;
		align-items: center;
		white-space: nowrap;
	}
	.dur {
		color: var(--nf-faint);
		font-family: var(--nf-mono);
		font-size: 11px;
	}
	.detail {
		padding: 10px 12px;
		border: 1px solid var(--nf-border);
		border-top: none;
		border-radius: 0 0 8px 8px;
		background: #0c0c16;
	}
	.kv {
		display: flex;
		gap: 10px;
		font-size: 12px;
		padding: 2px 0;
	}
	.kv span {
		color: var(--nf-faint);
		width: 84px;
	}
	.kv code {
		font-family: var(--nf-mono);
		color: var(--nf-text);
	}
	.blk {
		margin-top: 8px;
	}
	.blk span {
		display: block;
		color: var(--nf-faint);
		font-size: 11px;
		margin-bottom: 4px;
	}
	pre.nf-code {
		margin: 0;
	}
	pre.nf-code.err {
		color: var(--nf-red);
	}
	@media (max-width: 860px) {
		.evt {
			grid-template-columns: 1fr auto;
			grid-row-gap: 2px;
		}
		.type {
			grid-column: 1 / -1;
		}
		.summary {
			grid-column: 1 / -1;
			white-space: normal;
		}
	}
	.empty {
		color: var(--nf-muted);
		text-align: center;
		padding: 40px 20px;
	}
	.empty strong {
		color: var(--nf-text);
	}
</style>
