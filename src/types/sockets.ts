import { ClassicPreset } from 'rete';

// Socket type identifiers
export enum SocketType {
  Number = 'number',
  String = 'string',
  JSON = 'json',
  Embedding = 'embedding',
  DocumentChunk = 'documentChunk',
  ToolCall = 'toolCall',
  Any = 'any'
}

// Socket classes
export class NumberSocket extends ClassicPreset.Socket {
  constructor() {
    super('number');
  }
}

export class StringSocket extends ClassicPreset.Socket {
  constructor() {
    super('string');
  }
}

export class JSONSocket extends ClassicPreset.Socket {
  constructor() {
    super('json');
  }
}

export class EmbeddingSocket extends ClassicPreset.Socket {
  constructor() {
    super('embedding');
  }
}

export class DocumentChunkSocket extends ClassicPreset.Socket {
  constructor() {
    super('documentChunk');
  }
}

export class ToolCallSocket extends ClassicPreset.Socket {
  constructor() {
    super('toolCall');
  }
}

export class AnySocket extends ClassicPreset.Socket {
  constructor() {
    super('any');
  }
}

// Socket compatibility checker
export function isSocketCompatible(from: ClassicPreset.Socket, to: ClassicPreset.Socket): boolean {
  // Any socket can connect to Any socket
  if (from.name === 'any' || to.name === 'any') return true;
  
  // Same types can connect
  if (from.name === to.name) return true;
  
  // String can connect to JSON (will be parsed)
  if (from.name === 'string' && to.name === 'json') return true;
  
  // JSON can connect to String (will be stringified)
  if (from.name === 'json' && to.name === 'string') return true;
  
  return false;
}
