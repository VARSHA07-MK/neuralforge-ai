<script lang="ts">
	export let title: string;
	export let intro: string;
	export let planned: string[] = [];
</script>

<div class="nf-container wrap">
	<span class="nf-chip">In progress</span>
	<h1>{title}</h1>
	<p class="intro">{intro}</p>
	{#if planned.length}
		<div class="nf-card">
			<h2>Planned capabilities</h2>
			<ul>
				{#each planned as item}<li>{item}</li>{/each}
			</ul>
		</div>
	{/if}
	<slot />
</div>

<style lang="scss">
	.wrap {
		padding: 40px 20px 60px;
	}
	h1 {
		margin-top: 14px;
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
	.nf-card {
		margin-top: 22px;
		max-width: 640px;
	}
	.nf-card h2 {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--nf-faint);
		margin-bottom: 10px;
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	li {
		position: relative;
		padding-left: 18px;
		color: var(--nf-text);
		font-size: 14px;
		line-height: 1.5;
	}
	li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 8px;
		width: 7px;
		height: 7px;
		border-radius: 2px;
		background: linear-gradient(135deg, var(--nf-violet), var(--nf-cyan));
	}
</style>
