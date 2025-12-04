import { ClassicPreset } from 'rete';
import { stringSocket, documentChunkSocket } from '../sockets';

export class RetrieverNode extends ClassicPreset.Node {
  width = 250;
  height = 180;

  constructor() {
    super('Retriever');

    this.addInput('query', new ClassicPreset.Input(stringSocket, 'Query'));
    this.addOutput('chunks', new ClassicPreset.Output(documentChunkSocket, 'Chunks'));

    this.addControl(
      'topK',
      new ClassicPreset.InputControl('number', { initial: 5, placeholder: 'Top K' })
    );
    this.addControl(
      'filters',
      new ClassicPreset.InputControl('text', { initial: '{}', placeholder: 'Filters (JSON)' })
    );
    this.addControl(
      'embeddingModel',
      new ClassicPreset.InputControl('text', { initial: 'text-embedding-3-small', placeholder: 'Model' })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const topKControl = this.controls['topK'] as ClassicPreset.InputControl<'number'>;
    const filtersControl = this.controls['filters'] as ClassicPreset.InputControl<'text'>;
    const modelControl = this.controls['embeddingModel'] as ClassicPreset.InputControl<'text'>;

    return {
      query: inputs['query']?.[0] || '',
      topK: topKControl.value || 5,
      filters: filtersControl.value || '{}',
      embeddingModel: modelControl.value || 'text-embedding-3-small'
    };
  }
}
