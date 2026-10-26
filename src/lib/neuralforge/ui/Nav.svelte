<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	const links = [
		{ href: '/', label: 'Overview' },
		{ href: '/transformer', label: 'Transformer Lab' },
		{ href: '/mcp', label: 'MCP Lab' },
		{ href: '/agents', label: 'Agent Lab' },
		{ href: '/trace', label: 'Trace Studio' },
		{ href: '/learn', label: 'Learn' },
		{ href: '/about', label: 'About' }
	];

	// $page.url.pathname includes the base path in production; normalise it away.
	$: current = ($page.url.pathname.replace(base, '') || '/').replace(/\/$/, '') || '/';

	const isActive = (href: string) =>
		href === '/' ? current === '/' : current === href || current.startsWith(href + '/');
</script>

<nav class="nf-nav">
	<a class="brand" href={`${base}/`} aria-label="NeuralForge AI — home">
		<span class="mark" aria-hidden="true"></span>
		<span class="name">Neural<span class="accent">Forge</span> AI</span>
	</a>
	<div class="links">
		{#each links as link}
			<a href={`${base}${link.href}`} class:active={isActive(link.href)}>
				{link.label}
			</a>
		{/each}
	</div>
	<a class="repo" href="https://github.com/VARSHA07-MK/neuralforge-ai" target="_blank" rel="noopener noreferrer">
		GitHub ↗
	</a>
</nav>

<style lang="scss">
	.nf-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--nf-nav-h);
		z-index: 1000;
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 0 20px;
		background: rgba(10, 10, 18, 0.72);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--nf-border);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		font-weight: 700;
		font-size: 15px;
		color: var(--nf-text);
		text-decoration: none;
		flex-shrink: 0;
	}
	.brand .accent {
		color: var(--nf-violet-2);
	}
	.mark {
		width: 16px;
		height: 16px;
		border-radius: 5px;
		background: linear-gradient(135deg, var(--nf-violet), var(--nf-cyan));
		box-shadow: 0 0 14px rgba(139, 92, 246, 0.6);
	}
	.links {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.links::-webkit-scrollbar {
		display: none;
	}
	.links a {
		padding: 6px 11px;
		border-radius: 8px;
		font-size: 13.5px;
		color: var(--nf-muted);
		text-decoration: none;
		white-space: nowrap;
		transition: color 0.15s, background 0.15s;
	}
	.links a:hover {
		color: var(--nf-text);
		background: var(--nf-surface);
	}
	.links a.active {
		color: var(--nf-text);
		background: var(--nf-surface-2);
		box-shadow: inset 0 0 0 1px var(--nf-border-2);
	}
	.repo {
		flex-shrink: 0;
		font-size: 13px;
		color: var(--nf-muted);
		text-decoration: none;
	}
	.repo:hover {
		color: var(--nf-cyan);
	}
	@media (max-width: 720px) {
		.repo {
			display: none;
		}
	}
</style>
