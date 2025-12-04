import type { ExecutionResult, LogEntry, NodeRuntimeState } from '../types/graph';
import { topologicalSort } from './validation';
import { workerRegistry, clearWorkerCache } from '../workers/nodeWorkers';
import type { WorkerContext } from '../workers/nodeWorkers';

export class GraphExecutor {
  private nodeStates: Map<string, NodeRuntimeState> = new Map();
  private executionLogs: LogEntry[] = [];
  private aborted = false;

  constructor() {}

  // Execute entire graph
  async executeGraph(
    nodes: Map<string, any>,
    connections: any[],
    clearCache = false
  ): Promise<ExecutionResult> {
    if (clearCache) {
      clearWorkerCache();
    }

    this.reset();
    const startTime = Date.now();

    try {
      // Get execution order
      const order = topologicalSort(nodes, connections);
      if (!order) {
        throw new Error('Cannot execute graph with cycles');
      }

      // Execute nodes in order
      for (const nodeId of order) {
        if (this.aborted) break;

        const node = nodes.get(nodeId);
        if (!node) continue;

        await this.executeNode(nodeId, node, nodes, connections);
      }

      // Collect outputs from Output nodes
      const outputs: Record<string, any> = {};
      nodes.forEach((node, id) => {
        if (node.label === 'Output') {
          const state = this.nodeStates.get(id);
          if (state && state.outputs) {
            outputs[id] = state.outputs.value;
          }
        }
      });

      return {
        success: true,
        duration: Date.now() - startTime,
        logs: this.executionLogs,
        outputs
      };
    } catch (error: any) {
      return {
        success: false,
        duration: Date.now() - startTime,
        logs: this.executionLogs,
        outputs: {},
        errors: [{
          nodeId: 'graph',
          message: error.message,
          stack: error.stack
        }]
      };
    }
  }

  // Execute single node
  private async executeNode(
    nodeId: string,
    node: any,
    nodes: Map<string, any>,
    connections: any[]
  ): Promise<void> {
    // Update state to running
    this.updateNodeState(nodeId, { status: 'running', outputs: {}, lastRun: Date.now() });

    try {
      // Gather inputs from connected nodes
      const inputs = this.gatherInputs(nodeId, nodes, connections);

      // Get controls
      const controls: Record<string, any> = {};
      Object.entries(node.controls || {}).forEach(([key, control]: [string, any]) => {
        controls[key] = control.value;
      });

      // Determine node type
      const nodeType = this.getNodeType(node.label);
      const worker = workerRegistry[nodeType];

      if (!worker) {
        throw new Error(`No worker found for node type: ${nodeType}`);
      }

      // Execute worker
      const ctx: WorkerContext = {
        nodeId,
        nodeType,
        inputs,
        controls,
        log: (message: string, data?: any) => {
          console.log(`[${nodeId}] ${message}`, data);
        }
      };

      const result = await worker(ctx);

      // Update state
      this.updateNodeState(nodeId, {
        status: 'success',
        outputs: result.outputs,
        lastRun: Date.now()
      });

      // Add log
      this.executionLogs.push(result.log);
    } catch (error: any) {
      this.updateNodeState(nodeId, {
        status: 'error',
        outputs: {},
        error: error.message,
        lastRun: Date.now()
      });

      this.executionLogs.push({
        nodeId,
        nodeType: this.getNodeType(node.label),
        timestamp: Date.now(),
        start: Date.now(),
        end: Date.now(),
        duration: 0,
        status: 'error',
        message: error.message
      });

      throw error;
    }
  }

  // Gather inputs from connected nodes
  private gatherInputs(
    nodeId: string,
    nodes: Map<string, any>,
    connections: any[]
  ): Record<string, any[]> {
    const inputs: Record<string, any[]> = {};

    // Find connections targeting this node
    const incomingConnections = connections.filter(c => c.target === nodeId);

    incomingConnections.forEach(conn => {
      const sourceState = this.nodeStates.get(conn.source);
      if (sourceState && sourceState.outputs) {
        const value = sourceState.outputs[conn.sourceOutput];
        if (!inputs[conn.targetInput]) {
          inputs[conn.targetInput] = [];
        }
        inputs[conn.targetInput].push(value);
      }
    });

    return inputs;
  }

  // Execute from a specific node forward
  async executeForward(
    startNodeId: string,
    nodes: Map<string, any>,
    connections: any[]
  ): Promise<ExecutionResult> {
    this.reset();
    const startTime = Date.now();

    try {
      // Get all downstream nodes
      const downstream = this.getDownstreamNodes(startNodeId, connections);
      downstream.add(startNodeId);

      // Get execution order for all nodes
      const order = topologicalSort(nodes, connections);
      if (!order) {
        throw new Error('Cannot execute graph with cycles');
      }

      // Filter to only downstream nodes
      const filteredOrder = order.filter(id => downstream.has(id));

      // Execute
      for (const nodeId of filteredOrder) {
        if (this.aborted) break;
        const node = nodes.get(nodeId);
        if (node) {
          await this.executeNode(nodeId, node, nodes, connections);
        }
      }

      return {
        success: true,
        duration: Date.now() - startTime,
        logs: this.executionLogs,
        outputs: {}
      };
    } catch (error: any) {
      return {
        success: false,
        duration: Date.now() - startTime,
        logs: this.executionLogs,
        outputs: {},
        errors: [{
          nodeId: startNodeId,
          message: error.message,
          stack: error.stack
        }]
      };
    }
  }

  // Get all downstream nodes
  private getDownstreamNodes(startId: string, connections: any[]): Set<string> {
    const downstream = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = connections.filter(c => c.source === current);

      outgoing.forEach(conn => {
        if (!downstream.has(conn.target)) {
          downstream.add(conn.target);
          queue.push(conn.target);
        }
      });
    }

    return downstream;
  }

  // Helper to map node label to type
  private getNodeType(label: string): string {
    const mapping: Record<string, string> = {
      'Input': 'input',
      'Retriever': 'retriever',
      'Ranker': 'ranker',
      'Router': 'router',
      'Tool Call': 'toolCall',
      'Summarizer': 'summarizer',
      'Evaluator': 'evaluator',
      'Guardrail': 'guardrail',
      'Output': 'output'
    };
    return mapping[label] || label.toLowerCase();
  }

  // Update node state
  private updateNodeState(nodeId: string, state: Partial<NodeRuntimeState>): void {
    const current = this.nodeStates.get(nodeId) || {
      status: 'idle',
      outputs: {}
    };
    this.nodeStates.set(nodeId, { ...current, ...state });
  }

  // Get node state
  getNodeState(nodeId: string): NodeRuntimeState | undefined {
    return this.nodeStates.get(nodeId);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return this.executionLogs;
  }

  // Abort execution
  abort(): void {
    this.aborted = true;
  }

  // Reset executor
  private reset(): void {
    this.nodeStates.clear();
    this.executionLogs = [];
    this.aborted = false;
  }
}
