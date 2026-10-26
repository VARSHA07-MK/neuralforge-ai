/**
 * Sample MCP tools exposed by the simulated server.
 *
 * Each tool has a name, description, and JSON-Schema input — exactly the
 * metadata a real MCP server advertises via `tools/list`. Handlers are
 * deterministic and side-effect free (a security boundary: allowlisted,
 * read-only sample operations only).
 */
import { McpToolError, MCP_ERROR, type McpTool } from '../types';
import { SALES_DATA, totalsByRegion, type RegionTotal } from '../data/sales';

const salesSummary: McpTool = {
	name: 'sales_summary',
	title: 'Sales Summary',
	description:
		'Summarise the bundled sample sales dataset. Returns revenue totals grouped by region (highest first).',
	inputSchema: {
		type: 'object',
		properties: {
			metric: {
				type: 'string',
				description: 'Which metric to compute.',
				enum: ['total_revenue']
			},
			group_by: {
				type: 'string',
				description: 'Dimension to group by.',
				enum: ['region']
			}
		},
		required: ['metric', 'group_by']
	},
	handler: (args) => {
		if (args.group_by !== 'region') {
			throw new McpToolError(MCP_ERROR.TOOL_ERROR, `Unsupported group_by: ${String(args.group_by)}`);
		}
		const totals: RegionTotal[] = totalsByRegion(SALES_DATA);
		const lines = totals.map((t) => `${t.region}: $${t.total.toLocaleString('en-US')}`);
		return {
			content: [{ type: 'text', text: `Revenue by region\n${lines.join('\n')}` }],
			data: { metric: 'total_revenue', group_by: 'region', totals }
		};
	}
};

const calculator: McpTool = {
	name: 'calculator',
	title: 'Calculator',
	description: 'Evaluate a simple arithmetic operation on two numbers.',
	inputSchema: {
		type: 'object',
		properties: {
			a: { type: 'number', description: 'First operand.' },
			b: { type: 'number', description: 'Second operand.' },
			op: { type: 'string', description: 'Operation.', enum: ['add', 'subtract', 'multiply', 'divide'] }
		},
		required: ['a', 'b', 'op']
	},
	handler: (args) => {
		const a = Number(args.a);
		const b = Number(args.b);
		let result: number;
		switch (args.op) {
			case 'add':
				result = a + b;
				break;
			case 'subtract':
				result = a - b;
				break;
			case 'multiply':
				result = a * b;
				break;
			case 'divide':
				if (b === 0) throw new McpToolError(MCP_ERROR.TOOL_ERROR, 'Division by zero.');
				result = a / b;
				break;
			default:
				throw new McpToolError(MCP_ERROR.INVALID_PARAMS, `Unknown op: ${String(args.op)}`);
		}
		return { content: [{ type: 'text', text: String(result) }], data: { result } };
	}
};

const getWeather: McpTool = {
	name: 'get_weather',
	title: 'Get Weather (sample)',
	description:
		'Return illustrative, canned weather for a city. Sample data only — not a real weather service.',
	inputSchema: {
		type: 'object',
		properties: {
			city: { type: 'string', description: 'City name.' }
		},
		required: ['city']
	},
	handler: (args) => {
		const city = String(args.city);
		// Deterministic pseudo-data derived from the city name (clearly illustrative).
		const temp = 15 + (city.length % 10);
		return {
			content: [{ type: 'text', text: `${city}: ${temp}°C, partly cloudy (sample data)` }],
			data: { city, tempC: temp, conditions: 'partly cloudy', sample: true }
		};
	}
};

export const SAMPLE_TOOLS: McpTool[] = [salesSummary, calculator, getWeather];

export function findTool(name: string): McpTool | undefined {
	return SAMPLE_TOOLS.find((t) => t.name === name);
}
