import type { ValidationResult, ValidationError, ValidationWarning } from '../types/graph';
import { isSocketCompatible } from '../types/sockets';
import type { ClassicPreset } from 'rete';

// Detect cycles in graph using DFS
export function detectCycles(nodes: Map<string, any>, connections: any[]): string[][] {
  const graph = new Map<string, string[]>();
  const cycles: string[][] = [];
  
  // Build adjacency list
  nodes.forEach((_, id) => graph.set(id, []));
  connections.forEach(conn => {
    const from = conn.source;
    const to = conn.target;
    if (graph.has(from)) {
      graph.get(from)!.push(to);
    }
  });
  
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];
  
  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        // Found cycle
        const cycleStart = path.indexOf(neighbor);
        cycles.push([...path.slice(cycleStart), neighbor]);
        return true;
      }
    }
    
    path.pop();
    recStack.delete(node);
    return false;
  }
  
  nodes.forEach((_, id) => {
    if (!visited.has(id)) {
      dfs(id);
    }
  });
  
  return cycles;
}

// Topological sort for execution order
export function topologicalSort(nodes: Map<string, any>, connections: any[]): string[] | null {
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();
  
  // Initialize
  nodes.forEach((_, id) => {
    inDegree.set(id, 0);
    graph.set(id, []);
  });
  
  // Build graph and calculate in-degrees
  connections.forEach(conn => {
    const from = conn.source;
    const to = conn.target;
    graph.get(from)?.push(to);
    inDegree.set(to, (inDegree.get(to) || 0) + 1);
  });
  
  // Queue with nodes that have no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, node) => {
    if (degree === 0) queue.push(node);
  });
  
  const sorted: string[] = [];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }
  
  // If sorted length != nodes length, there's a cycle
  return sorted.length === nodes.size ? sorted : null;
}

// Validate graph
export function validateGraph(
  nodes: Map<string, any>,
  connections: any[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check for cycles
  const cycles = detectCycles(nodes, connections);
  if (cycles.length > 0) {
    cycles.forEach(cycle => {
      errors.push({
        type: 'cycle',
        message: `Cycle detected: ${cycle.join(' → ')}`,
        nodeIds: cycle
      });
    });
  }
  
  // Check socket compatibility
  connections.forEach(conn => {
    const sourceNode = nodes.get(conn.source);
    const targetNode = nodes.get(conn.target);
    
    if (!sourceNode || !targetNode) return;
    
    const sourceOutput = sourceNode.outputs[conn.sourceOutput];
    const targetInput = targetNode.inputs[conn.targetInput];
    
    if (sourceOutput && targetInput) {
      const compatible = isSocketCompatible(sourceOutput.socket, targetInput.socket);
      if (!compatible) {
        errors.push({
          type: 'incompatible_socket',
          message: `Incompatible socket types: ${sourceOutput.socket.name} → ${targetInput.socket.name}`,
          connectionId: conn.id
        });
      }
    }
  });
  
  // Check for disconnected nodes
  const connectedNodes = new Set<string>();
  connections.forEach(conn => {
    connectedNodes.add(conn.source);
    connectedNodes.add(conn.target);
  });
  
  nodes.forEach((node, id) => {
    // Skip nodes that naturally don't need connections (like Input nodes)
    if (node.label === 'Input') return;
    
    if (!connectedNodes.has(id)) {
      warnings.push({
        type: 'disconnected_node',
        message: `Node "${node.label}" (${id}) is not connected`,
        nodeId: id
      });
    }
  });
  
  // Check for required inputs
  nodes.forEach((node, id) => {
    const nodeConnections = connections.filter(c => c.target === id);
    Object.entries(node.inputs || {}).forEach(([key, input]: [string, any]) => {
      const hasConnection = nodeConnections.some(c => c.targetInput === key);
      if (!hasConnection && input.socket.name !== 'any') {
        warnings.push({
          type: 'unused_output',
          message: `Node "${node.label}" input "${key}" is not connected`,
          nodeId: id
        });
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
