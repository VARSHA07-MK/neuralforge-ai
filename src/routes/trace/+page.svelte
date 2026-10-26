<script lang="ts">
	import Placeholder from '~/lib/neuralforge/ui/Placeholder.svelte';
</script>

<svelte:head><title>Trace Studio — NeuralForge AI</title></svelte:head>

<Placeholder
	title="Trace Studio"
	intro="One unified, typed timeline that links transformer, MCP, and agent activity for a single run. The shared TraceEvent spine that powers it is already built — the MCP Lab emits into it today."
	planned={[
		'Filter events by component, type, and status',
		'Inspect individual events and follow parent/child relationships',
		'View structured input/output payloads',
		'Highlight the corresponding architecture node',
		'Compare successful and failed runs',
		'Export sanitized traces as JSON'
	]}
/>
