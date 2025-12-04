import { ClassicPreset } from 'rete';
import { stringSocket, jsonSocket } from '../sockets';

export class RouterNode extends ClassicPreset.Node {
  width = 250;
  height = 160;

  constructor() {
    super('Router');

    this.addInput('query', new ClassicPreset.Input(stringSocket, 'Query'));
    this.addInput('context', new ClassicPreset.Input(jsonSocket, 'Context'));
    this.addOutput('route', new ClassicPreset.Output(stringSocket, 'Route'));
    this.addOutput('data', new ClassicPreset.Output(jsonSocket, 'Data'));

    this.addControl(
      'routingRules',
      new ClassicPreset.InputControl('text', {
        initial: JSON.stringify({ default: 'summarizer' }, null, 2),
        placeholder: 'Routing Rules (JSON)'
      })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const rulesControl = this.controls['routingRules'] as ClassicPreset.InputControl<'text'>;

    return {
      query: inputs['query']?.[0] || '',
      context: inputs['context']?.[0] || {},
      routingRules: rulesControl.value || '{}'
    };
  }
}
