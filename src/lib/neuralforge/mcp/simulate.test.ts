import { describe, it, expect } from 'vitest';
import { simulateMcpCall } from './simulate';
import { McpServer } from './server';
import { SAMPLE_TOOLS } from './tools';
import { MCP_ERROR } from '../types';
import { topRegion } from '../data/sales';

describe('MCP server', () => {
	it('advertises the sample tools via tools/list', () => {
		const res = new McpServer().handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
		const tools = (res.result as { tools: unknown[] }).tools;
		expect(tools).toHaveLength(SAMPLE_TOOLS.length);
	});
});

describe('simulateMcpCall — happy path', () => {
	const out = simulateMcpCall({
		tool: 'sales_summary',
		args: { metric: 'total_revenue', group_by: 'region' }
	});

	it('succeeds and walks the full architecture in order', () => {
		expect(out.ok).toBe(true);
		const components = out.events.map((e) => e.component);
		expect(components).toEqual([
			'user',
			'host',
			'mcp-client',
			'mcp-server',
			'tool', // tool.execute
			'tool', // tool.result
			'mcp-client' // tools/result
		]);
	});

	it('returns the region totals computed from the sample data', () => {
		const data = (out.response?.result as { data: { totals: { region: string; total: number }[] } })
			.data;
		expect(data.totals[0]).toEqual(topRegion()); // East, 453000
		expect(data.totals[0].region).toBe('East');
		expect(data.totals[0].total).toBe(453_000);
	});

	it('is deterministic — identical event stream across runs', () => {
		const a = simulateMcpCall({ tool: 'sales_summary', args: { metric: 'total_revenue', group_by: 'region' } });
		const b = simulateMcpCall({ tool: 'sales_summary', args: { metric: 'total_revenue', group_by: 'region' } });
		const shape = (o: typeof a) => o.events.map((e) => [e.seq, e.component, e.type, e.status, e.t]);
		expect(shape(a)).toEqual(shape(b));
	});
});

describe('simulateMcpCall — failure injection', () => {
	const base = { tool: 'sales_summary', args: { metric: 'total_revenue', group_by: 'region' } };

	it('invalid-args → INVALID_PARAMS, surfaced as a controlled error', () => {
		const out = simulateMcpCall({ ...base, failureMode: 'invalid-args' });
		expect(out.ok).toBe(false);
		expect(out.response?.error?.code).toBe(MCP_ERROR.INVALID_PARAMS);
	});

	it('denied → PERMISSION_DENIED and the call never reaches the server', () => {
		const out = simulateMcpCall({ ...base, failureMode: 'denied' });
		expect(out.ok).toBe(false);
		expect(out.response?.error?.code).toBe(MCP_ERROR.PERMISSION_DENIED);
		expect(out.events.some((e) => e.component === 'mcp-server')).toBe(false);
	});

	it('timeout → TIMEOUT error from the client', () => {
		const out = simulateMcpCall({ ...base, failureMode: 'timeout' });
		expect(out.ok).toBe(false);
		expect(out.response?.error?.code).toBe(MCP_ERROR.TIMEOUT);
		expect(out.events.some((e) => e.type === 'tools/call.timeout')).toBe(true);
	});

	it('tool-error → TOOL_ERROR raised at the tool layer', () => {
		const out = simulateMcpCall({ ...base, failureMode: 'tool-error' });
		expect(out.ok).toBe(false);
		expect(out.response?.error?.code).toBe(MCP_ERROR.TOOL_ERROR);
		const toolEvent = out.events.find((e) => e.type === 'tool.execute');
		expect(toolEvent?.status).toBe('error');
	});

	it('every emitted event is labelled simulated', () => {
		const out = simulateMcpCall(base);
		expect(out.events.every((e) => e.provenance === 'simulated')).toBe(true);
	});
});
