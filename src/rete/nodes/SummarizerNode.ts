import { ClassicPreset } from 'rete';
import { stringSocket, documentChunkSocket } from '../sockets';

export class SummarizerNode extends ClassicPreset.Node {
  width = 250;
  height = 160;

  constructor() {
    super('Summarizer');

    this.addInput('text', new ClassicPreset.Input(stringSocket, 'Text'));
    this.addInput('chunks', new ClassicPreset.Input(documentChunkSocket, 'Chunks'));
    this.addOutput('summary', new ClassicPreset.Output(stringSocket, 'Summary'));

    this.addControl(
      'model',
      new ClassicPreset.InputControl('text', { initial: 'gpt-4-turbo', placeholder: 'Model' })
    );
    this.addControl(
      'maxLength',
      new ClassicPreset.InputControl('number', { initial: 200, placeholder: 'Max Length' })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const modelControl = this.controls['model'] as ClassicPreset.InputControl<'text'>;
    const lengthControl = this.controls['maxLength'] as ClassicPreset.InputControl<'number'>;

    return {
      text: inputs['text']?.[0] || '',
      chunks: inputs['chunks']?.[0] || [],
      model: modelControl.value || 'gpt-4-turbo',
      maxLength: lengthControl.value || 200
    };
  }
}
