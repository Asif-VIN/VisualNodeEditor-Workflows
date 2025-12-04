import { ClassicPreset } from 'rete';
import { documentChunkSocket } from '../sockets';

export class RankerNode extends ClassicPreset.Node {
  width = 250;
  height = 150;

  constructor() {
    super('Ranker');

    this.addInput('chunks', new ClassicPreset.Input(documentChunkSocket, 'Chunks'));
    this.addOutput('ranked', new ClassicPreset.Output(documentChunkSocket, 'Ranked'));

    this.addControl(
      'rerankModel',
      new ClassicPreset.InputControl('text', { initial: 'cohere-rerank-v3', placeholder: 'Rerank Model' })
    );
    this.addControl(
      'scoreThreshold',
      new ClassicPreset.InputControl('number', { initial: 0.5, placeholder: 'Threshold' })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const modelControl = this.controls['rerankModel'] as ClassicPreset.InputControl<'text'>;
    const thresholdControl = this.controls['scoreThreshold'] as ClassicPreset.InputControl<'number'>;

    return {
      chunks: inputs['chunks']?.[0] || [],
      rerankModel: modelControl.value || 'cohere-rerank-v3',
      scoreThreshold: thresholdControl.value || 0.5
    };
  }
}
