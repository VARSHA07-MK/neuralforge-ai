/**
 * NeuralForge AI — shared typed contracts.
 *
 * Pure types + enums shared by the MCP simulator, the multi-agent workflow
 * engine, and the unified Trace Studio. No Svelte or DOM imports: these
 * contracts are consumed by both the deterministic engines and the UI.
 */

/** Whether an event reflects a real execution or a labelled simulation. */
export type Provenance = 'simulated' | 'real';

/** Which architectural component an event belongs to. */
export type Component =
	| 'user'
	| 'host'
	| 'model'
	| 'mcp-client'
	| 'mcp-server'
	| 'tool'
	| 'planner'
	| 'research'
	| 'analyst'
	| 'executor'
	| 'reviewer'
	| 'coordinator';

/** Lifecycle status shared by trace events, tasks, and tool calls. */
export type Status = 'pending' | 'running' | 'success' | 'error' | 'cancelled' | 'skipped';

/**
 * A single typed, timestamped event on the unified timeline. Every module
 * records into the same shape so Trace Studio can render one coherent run.
 */
export interface TraceEvent {
	/** Unique within a run. */
	id: string;
	/** The run this event belongs to. */
	runId: string;
	/** Parent event for correlation (e.g. a tool result's request), or null. */
	parentId: string | null;
	/** Deterministic ordering index within the run. */
	seq: number;
	/** Relative time from run start, in ms (simulated unless provenance==='real'). */
	t: number;
	/** Duration in ms, when measured or simulated. */
	duration?: number;
	component: Component;
	/** Dotted event type, e.g. 'tools/list', 'tools/call', 'task.start'. */
	type: string;
	status: Status;
	/** Short human-readable summary for the timeline row. */
	summary: string;
	/** Structured input payload (sanitized). */
	input?: unknown;
	/** Structured output payload (sanitized). */
	output?: unknown;
	error?: TraceError | null;
	provenance: Provenance;
}

export interface TraceError {
	code: string;
	message: string;
}

/* ------------------------------------------------------------------ */
/* Model Context Protocol (MCP) — simulation contracts                 */
/* Shapes follow the official MCP spec (JSON-RPC 2.0, tools/list,      */
/* tools/call) closely enough to be educational, without claiming to   */
/* be a live connection.                                               */
/* ------------------------------------------------------------------ */

/** A minimal JSON Schema subset used to describe tool inputs. */
export interface JsonSchema {
	type: 'object';
	properties: Record<string, JsonSchemaProperty>;
	required: string[];
}

export interface JsonSchemaProperty {
	type: 'string' | 'number' | 'integer' | 'boolean';
	description: string;
	enum?: string[];
}

/** Structured result returned by a simulated tool handler. */
export interface McpToolResult {
	/** Primary content blocks, mirroring MCP's content array. */
	content: Array<{ type: 'text'; text: string }>;
	/** Machine-readable payload for downstream agents (NeuralForge extension). */
	data?: unknown;
	isError?: boolean;
}

/** A sample MCP tool exposed by the simulated server. */
export interface McpTool {
	name: string;
	title: string;
	description: string;
	inputSchema: JsonSchema;
	/** Deterministic handler. Throws {@link McpToolError} on invalid input. */
	handler: (args: Record<string, unknown>) => McpToolResult;
}

/** Error thrown by a tool handler; mapped to a JSON-RPC error by the server. */
export class McpToolError extends Error {
	constructor(
		public code: number,
		message: string
	) {
		super(message);
		this.name = 'McpToolError';
	}
}

/** JSON-RPC 2.0 request as the MCP client would send it. */
export interface JsonRpcRequest {
	jsonrpc: '2.0';
	id: number;
	method: string;
	params?: Record<string, unknown>;
}

/** JSON-RPC 2.0 response as the MCP server would return it. */
export interface JsonRpcResponse {
	jsonrpc: '2.0';
	id: number;
	result?: unknown;
	error?: { code: number; message: string; data?: unknown };
}

/** Standard-ish JSON-RPC / MCP error codes used by the simulator. */
export const MCP_ERROR = {
	INVALID_PARAMS: -32602,
	METHOD_NOT_FOUND: -32601,
	PERMISSION_DENIED: -32001,
	TIMEOUT: -32002,
	TOOL_ERROR: -32003
} as const;

/** Failure the user can deliberately inject to see controlled error handling. */
export type McpFailureMode = 'none' | 'invalid-args' | 'denied' | 'timeout' | 'tool-error';

/* ------------------------------------------------------------------ */
/* Multi-agent workflow contracts                                      */
/* ------------------------------------------------------------------ */

export type AgentRole =
	| 'planner'
	| 'research'
	| 'analyst'
	| 'executor'
	| 'reviewer'
	| 'coordinator';

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'blocked';

export interface AgentDef {
	role: AgentRole;
	title: string;
	description: string;
}

/** A unit of work in a workflow, owned by one agent. */
export interface WorkflowTask {
	id: string;
	title: string;
	agent: AgentRole;
	/** Task ids that must complete before this one can run. */
	dependsOn: string[];
	status: TaskStatus;
	attempts: number;
	maxAttempts: number;
	/** Simulated duration in ms. */
	durationMs: number;
	/** Optional deterministic failure injection for this task. */
	failUntilAttempt?: number;
	output?: unknown;
	error?: TraceError | null;
}

export interface WorkflowDef {
	id: string;
	title: string;
	description: string;
	tasks: WorkflowTask[];
}
