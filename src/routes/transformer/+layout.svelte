<script lang="ts">
	import Topbar from '~/components/Topbar.svelte';
	import { isLoaded, userId } from '~/store';
	import Article from '~/components/article/Article.svelte';
	import { onMount } from 'svelte';
	import { Spinner } from 'flowbite-svelte';
	import { page } from '$app/stores';

	let topBarHeight = 0;
	let scrollLeft = 0;

	let minScreenWidth = 1300;

	let intersectionObserver: IntersectionObserver;
	let tobBarActive = false;
	let target: HTMLElement;

	onMount(() => {
		isLoaded.set(true);

		const userIdParam = $page.url.searchParams.get('userId');
		if (userIdParam) {
			userId.set(userIdParam);
		}

		intersectionObserver = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: '0px',
			threshold: 0.2
		});

		if (target) {
			intersectionObserver.observe(target);
		}
		window.addEventListener('scroll', handleMobileScrollX);

		return () => {
			intersectionObserver.disconnect();
			window.removeEventListener('scroll', handleMobileScrollX);
		};
	});

	function handleIntersection(entries: any[]) {
		entries.forEach((entry: any) => {
			tobBarActive = entry.isIntersecting;
		});
	}

	const handleMobileScrollX = () => {
		scrollLeft = window.scrollX || document.documentElement.scrollLeft;
	};
</script>

<div id="app" style={`--min-screen-width:${minScreenWidth}px;`}>
	<div id="landing">
		<header bind:offsetHeight={topBarHeight} style="transform: translateX({-1 * scrollLeft}px);">
			<Topbar isActive={tobBarActive} />
		</header>
		<main id="main" style={`padding-top:${topBarHeight}px`} bind:this={target}>
			{#if $isLoaded}
				<slot />
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<Spinner color="purple" />
				</div>
			{/if}
		</main>
	</div>
	<div class="article h-auto w-full">
		<Article />
	</div>
</div>

<style lang="scss">
	#app {
		height: 100vh;
		min-width: 900px;
	}
	#landing {
		height: 100%;
		width: 100%;
		min-width: var(--min-screen-width);
	}
	header {
		min-width: var(--min-screen-width);
		width: 100%;
		position: fixed;
		z-index: $TOP_BAR_INDEX;
	}
	main {
		position: relative;
		height: 95%;
		width: 100%;
		display: flex;
		justify-content: start;
		overflow: hidden;
	}
	.article {
		padding-top: 2rem;
	}
</style>
