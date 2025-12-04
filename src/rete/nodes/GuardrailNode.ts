import { ClassicPreset } from 'rete';
import { stringSocket, jsonSocket } from '../sockets';

export class GuardrailNode extends ClassicPreset.Node {
  width = 250;
  height = 150;

  constructor() {
    super('Guardrail');

    this.addInput('answer', new ClassicPreset.Input(stringSocket, 'Answer'));
    this.addOutput('result', new ClassicPreset.Output(stringSocket, 'Result'));
    this.addOutput('status', new ClassicPreset.Output(jsonSocket, 'Status'));

    this.addControl(
      'policies',
      new ClassicPreset.InputControl('text', {
        initial: JSON.stringify({ blockPII: true, blockToxic: true }, null, 2),
        placeholder: 'Policies (JSON)'
      })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const policiesControl = this.controls['policies'] as ClassicPreset.InputControl<'text'>;

    return {
      answer: inputs['answer']?.[0] || '',
      policies: policiesControl.value || '{}'
    };
  }
}
