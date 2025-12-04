import { NumberSocket, StringSocket, JSONSocket, EmbeddingSocket, DocumentChunkSocket, ToolCallSocket, AnySocket } from '../types/sockets';

// Export singleton instances for reuse
export const numberSocket = new NumberSocket();
export const stringSocket = new StringSocket();
export const jsonSocket = new JSONSocket();
export const embeddingSocket = new EmbeddingSocket();
export const documentChunkSocket = new DocumentChunkSocket();
export const toolCallSocket = new ToolCallSocket();
export const anySocket = new AnySocket();
