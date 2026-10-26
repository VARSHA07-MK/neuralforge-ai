/**
 * TraceRecorder — the deterministic spine of NeuralForge AI.
 *
 * Every module (MCP, agents, the guided scenario) emits into a recorder, which
 * assigns stable ids, a monotonic sequence number, and a simulated relative
 * clock. Trace Studio then renders the resulting events as one timeline.
 *
 * Deterministic by construction: no Date.now(), no Math.random(). The same
 * inputs always produce the same event stream, which is what lets tests assert
 * exact sequences and lets a run be replayed.
 */
import type { Component, Provenance, Status, TraceError, TraceEvent } from '../types';

export interface EmitInput {
	component: Component;
	type: string;
	status: Status;
	summary: string;
	parentId?: string | null;
	/** Simulated duration in ms; advances the recorder clock when provided. */
	durationMs?: number;
	input?: unknown;
	output?: unknown;
	error?: TraceError | null;
	provenance?: Provenance;
}

export class TraceRecorder {
	private events: TraceEvent[] = [];
	private seq = 0;
	/** Simulated relative clock in ms. */
	private clock = 0;

	constructor(public readonly runId: string) {}

	/** Append one event at the current simulated time. */
	emit(e: EmitInput): TraceEvent {
		const event: TraceEvent = {
			id: `${this.runId}:${this.seq}`,
			runId: this.runId,
			parentId: e.parentId ?? null,
			seq: this.seq,
			t: this.clock,
			duration: e.durationMs,
			component: e.component,
			type: e.type,
			status: e.status,
			summary: e.summary,
			input: e.input,
			output: e.output,
			error: e.error ?? null,
			provenance: e.provenance ?? 'simulated'
		};
		this.seq += 1;
		if (e.durationMs && e.durationMs > 0) this.clock += e.durationMs;
		this.events.push(event);
		return event;
	}

	/** Current simulated time (ms from run start). */
	now(): number {
		return this.clock;
	}

	/** Move the simulated clock forward without emitting an event. */
	advance(ms: number): void {
		if (ms > 0) this.clock += ms;
	}

	/** Pin the simulated clock (used to model parallel branches). */
	setClock(ms: number): void {
		this.clock = ms;
	}

	/** Immutable snapshot of all events so far, in emission order. */
	getEvents(): TraceEvent[] {
		return [...this.events];
	}

	/** Children of a given event, for the inspector's parent/child view. */
	childrenOf(id: string): TraceEvent[] {
		return this.events.filter((ev) => ev.parentId === id);
	}
}
