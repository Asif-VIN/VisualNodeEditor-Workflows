import { writable } from 'svelte/store';
import type { ExecutionResult, LogEntry, NodeRuntimeState } from '../types/graph';

export interface ExecutionState {
  isRunning: boolean;
  result: ExecutionResult | null;
  nodeStates: Map<string, NodeRuntimeState>;
  selectedLog: LogEntry | null;
}

const initialState: ExecutionState = {
  isRunning: false,
  result: null,
  nodeStates: new Map(),
  selectedLog: null
};

export const executionStore = writable<ExecutionState>(initialState);

// Helper functions
export const executionActions = {
  setRunning(running: boolean) {
    executionStore.update(state => ({ ...state, isRunning: running }));
  },

  setResult(result: ExecutionResult) {
    executionStore.update(state => ({ ...state, result }));
  },

  updateNodeState(nodeId: string, nodeState: NodeRuntimeState) {
    executionStore.update(state => {
      const nodeStates = new Map(state.nodeStates);
      nodeStates.set(nodeId, nodeState);
      return { ...state, nodeStates };
    });
  },

  selectLog(log: LogEntry | null) {
    executionStore.update(state => ({ ...state, selectedLog: log }));
  },

  reset() {
    executionStore.set(initialState);
  }
};
