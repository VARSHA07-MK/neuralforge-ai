/**
 * Simulated MCP server.
 *
 * Handles the two JSON-RPC methods the labs demonstrate — `tools/list` and
 * `tools/call` — with the same validation and error semantics a real server
 * would apply. This is NOT a network server and opens no connection; it is an
 * in-memory model of the protocol for teaching.
 */
import {
	MCP_ERROR,
	McpToolError,
	type JsonRpcRequest,
	type JsonRpcResponse,
	type JsonSchema,
	type McpTool
} from '../types';
import { SAMPLE_TOOLS, findTool } from './tools';

/** Validate args against a tool's JSON Schema. Returns an error message or null. */
export function validateArgs(schema: JsonSchema, args: Record<string, unknown>): string | null {
	for (const key of schema.required) {
		if (!(key in args) || args[key] === undefined || args[key] === null || args[key] === '') {
			return `Missing required parameter: "${key}"`;
		}
	}
	for (const [key, value] of Object.entries(args)) {
		const prop = schema.properties[key];
		if (!prop) return `Unknown parameter: "${key}"`;
		const t = typeof value;
		if (prop.type === 'number' || prop.type === 'integer') {
			if (t !== 'number' || Number.isNaN(value as number)) return `"${key}" must be a number`;
		} else if (prop.type === 'boolean') {
			if (t !== 'boolean') return `"${key}" must be a boolean`;
		} else if (prop.type === 'string') {
			if (t !== 'string') return `"${key}" must be a string`;
			if (prop.enum && !prop.enum.includes(value as string)) {
				return `"${key}" must be one of: ${prop.enum.join(', ')}`;
			}
		}
	}
	return null;
}

export class McpServer {
	constructor(private readonly tools: McpTool[] = SAMPLE_TOOLS) {}

	/** Advertised tool metadata, as returned by `tools/list`. */
	listTools() {
		return this.tools.map((t) => ({
			name: t.name,
			title: t.title,
			description: t.description,
			inputSchema: t.inputSchema
		}));
	}

	/** Handle a JSON-RPC request and return a JSON-RPC response. */
	handle(req: JsonRpcRequest): JsonRpcResponse {
		const base = { jsonrpc: '2.0' as const, id: req.id };
		try {
			if (req.method === 'tools/list') {
				return { ...base, result: { tools: this.listTools() } };
			}
			if (req.method === 'tools/call') {
				const name = req.params?.name as string;
				const args = (req.params?.arguments ?? {}) as Record<string, unknown>;
				const tool = findTool(name);
				if (!tool) {
					return {
						...base,
						error: { code: MCP_ERROR.METHOD_NOT_FOUND, message: `Unknown tool: ${name}` }
					};
				}
				const invalid = validateArgs(tool.inputSchema, args);
				if (invalid) {
					return { ...base, error: { code: MCP_ERROR.INVALID_PARAMS, message: invalid } };
				}
				const result = tool.handler(args);
				return { ...base, result };
			}
			return {
				...base,
				error: { code: MCP_ERROR.METHOD_NOT_FOUND, message: `Unknown method: ${req.method}` }
			};
		} catch (err) {
			if (err instanceof McpToolError) {
				return { ...base, error: { code: err.code, message: err.message } };
			}
			return {
				...base,
				error: { code: MCP_ERROR.TOOL_ERROR, message: (err as Error).message ?? 'Tool failed' }
			};
		}
	}
}
