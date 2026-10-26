<script lang="ts">
	import '~/styles/app.css';
	import '~/styles/global.scss';
	import '~/styles/neuralforge.scss';
	import Nav from '~/lib/neuralforge/ui/Nav.svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	// The Transformer Lab keeps its own full-screen (light) chrome; every other
	// route is wrapped in the dark NeuralForge shell with the top navigation.
	$: path = ($page.url.pathname.replace(base, '') || '/').replace(/\/$/, '') || '/';
	$: isTransformer = path === '/transformer' || path.startsWith('/transformer/');
</script>

{#if isTransformer}
	<slot />
{:else}
	<div class="nf-shell">
		<Nav />
		<div class="nf-main">
			<slot />
		</div>
	</div>
{/if}
