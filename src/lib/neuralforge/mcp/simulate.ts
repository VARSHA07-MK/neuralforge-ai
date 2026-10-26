/**
 * MCP request-path simulation.
 *
 * Walks a tool invocation through the architecture
 *   user → host → MCP client → MCP server → tool → result
 * emitting a typed TraceEvent at each hop. Supports deliberate failure
 * injection so the lab can show controlled error handling.
 *
 * Everything here is simulated and labelled as such. No network I/O occurs.
 */
import { TraceRecorder } from '../trace/recorder';
import { McpServer } from './server';
import { findTool } from './tools';
import {
	MCP_ERROR,
	type JsonRpcRequest,
	type JsonRpcResponse,
	type McpFailureMode,
	type TraceEvent
} from '../types';

export interface McpCallOptions {
	tool: string;
	args: Record<string, unknown>;
	failureMode?: McpFailureMode;
	runId?: string;
	/** Reuse an existing recorder (e.g. the guided scenario's shared timeline). */
	recorder?: TraceRecorder;
	requestId?: number;
}

export interface McpCallOutcome {
	events: TraceEvent[];
	response: JsonRpcResponse | null;
	ok: boolean;
	recorder: TraceRecorder;
}

/** Simulated latency per hop, in ms (deterministic). */
const HOP = { user: 0, host: 4, clientSend: 3, serverRecv: 2, toolExec: 12, clientRecv: 3 };

export function simulateMcpCall(opts: McpCallOptions): McpCallOutcome {
	const mode: McpFailureMode = opts.failureMode ?? 'none';
	const recorder = opts.recorder ?? new TraceRecorder(opts.runId ?? 'mcp-run');
	const id = opts.requestId ?? 1;
	const server = new McpServer();

	const userEv = recorder.emit({
		component: 'user',
		type: 'user.request',
		status: 'success',
		summary: `Invoke tool "${opts.tool}"`,
		input: { tool: opts.tool, args: opts.args }
	});

	const hostEv = recorder.emit({
		component: 'host',
		type: 'host.route',
		status: 'success',
		summary: 'Host selects the MCP tool and asks the client to call it',
		parentId: userEv.id,
		durationMs: HOP.host
	});

	// Permission boundary: a denied call never leaves the client.
	if (mode === 'denied') {
		const err = { code: MCP_ERROR.PERMISSION_DENIED, message: `Permission denied for tool "${opts.tool}"` };
		recorder.emit({
			component: 'mcp-client',
			type: 'tools/call',
			status: 'error',
			summary: 'Client blocked the call — permission denied',
			parentId: hostEv.id,
			durationMs: HOP.clientSend,
			error: { code: String(err.code), message: err.message }
		});
		return done(recorder, { jsonrpc: '2.0', id, error: err }, false);
	}

	// For invalid-args mode we genuinely send empty arguments so the server's
	// real schema validation rejects them.
	const sentArgs = mode === 'invalid-args' ? {} : opts.args;
	const request: JsonRpcRequest = {
		jsonrpc: '2.0',
		id,
		method: 'tools/call',
		params: { name: opts.tool, arguments: sentArgs }
	};

	const clientEv = recorder.emit({
		component: 'mcp-client',
		type: 'tools/call',
		status: 'running',
		summary: 'Client sends tools/call request to the server',
		parentId: hostEv.id,
		durationMs: HOP.clientSend,
		input: request
	});

	// Transport timeout: the request is sent but no response arrives in time.
	if (mode === 'timeout') {
		const err = { code: MCP_ERROR.TIMEOUT, message: 'Request timed out waiting for the server' };
		recorder.emit({
			component: 'mcp-client',
			type: 'tools/call.timeout',
			status: 'error',
			summary: 'No response within the time budget — timeout',
			parentId: clientEv.id,
			durationMs: 30,
			error: { code: String(err.code), message: err.message }
		});
		return done(recorder, { jsonrpc: '2.0', id, error: err }, false);
	}

	const serverEv = recorder.emit({
		component: 'mcp-server',
		type: 'server.receive',
		status: 'running',
		summary: `Server received tools/call for "${opts.tool}"`,
		parentId: clientEv.id,
		durationMs: HOP.serverRecv
	});

	// Simulated tool runtime failure, modelled at the tool layer.
	if (mode === 'tool-error') {
		const err = { code: MCP_ERROR.TOOL_ERROR, message: 'Simulated tool runtime failure' };
		recorder.emit({
			component: 'tool',
			type: 'tool.execute',
			status: 'error',
			summary: `Tool "${opts.tool}" raised an error`,
			parentId: serverEv.id,
			durationMs: HOP.toolExec,
			error: { code: String(err.code), message: err.message }
		});
		return done(recorder, { jsonrpc: '2.0', id, error: err }, false);
	}

	// Normal + invalid-args paths both go through the real server.
	const tool = findTool(opts.tool);
	const toolEv = recorder.emit({
		component: 'tool',
		type: 'tool.execute',
		status: 'running',
		summary: `Executing "${opts.tool}"`,
		parentId: serverEv.id,
		durationMs: HOP.toolExec,
		input: sentArgs
	});

	const response = server.handle(request);
	const ok = !response.error;

	recorder.emit({
		component: 'tool',
		type: 'tool.result',
		status: ok ? 'success' : 'error',
		summary: ok ? `"${opts.tool}" returned a result` : `"${opts.tool}" rejected: ${response.error?.message}`,
		parentId: toolEv.id,
		output: ok ? response.result : undefined,
		error: ok ? null : { code: String(response.error?.code), message: response.error?.message ?? '' }
	});

	recorder.emit({
		component: 'mcp-client',
		type: 'tools/result',
		status: ok ? 'success' : 'error',
		summary: ok ? 'Client received the tool result' : 'Client received an error response',
		parentId: clientEv.id,
		durationMs: HOP.clientRecv,
		output: response
	});

	void tool; // tool metadata already validated inside server.handle
	return done(recorder, response, ok);
}

function done(recorder: TraceRecorder, response: JsonRpcResponse | null, ok: boolean): McpCallOutcome {
	return { events: recorder.getEvents(), response, ok, recorder };
}
