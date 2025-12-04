// Graph serialization format
export interface SerializedGraph {
  version: string;
  meta: GraphMeta;
  nodes: SerializedNode[];
  connections: SerializedConnection[];
  comments?: SerializedComment[];
}

export interface GraphMeta {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodesCount: number;
  connectionsCount: number;
}

export interface SerializedNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  controls: Record<string, any>;
}

export interface SerializedConnection {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

export interface SerializedComment {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  links?: string[]; // Node IDs
}

// Execution types
export interface ExecutionResult {
  success: boolean;
  duration: number;
  logs: LogEntry[];
  outputs: Record<string, any>;
  errors?: ExecutionError[];
}

export interface LogEntry {
  nodeId: string;
  nodeType: string;
  timestamp: number;
  start: number;
  end: number;
  duration: number;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  message: string;
  data?: any;
}

export interface ExecutionError {
  nodeId: string;
  message: string;
  stack?: string;
}

export interface NodeRuntimeState {
  status: 'idle' | 'pending' | 'running' | 'success' | 'error';
  outputs: Record<string, any>;
  error?: string;
  lastRun?: number;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'cycle' | 'incompatible_socket' | 'missing_input' | 'invalid_data';
  message: string;
  nodeIds?: string[];
  connectionId?: string;
}

export interface ValidationWarning {
  type: 'disconnected_node' | 'unused_output' | 'deprecated';
  message: string;
  nodeId?: string;
}
