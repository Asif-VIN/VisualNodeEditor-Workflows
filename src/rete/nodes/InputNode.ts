import { ClassicPreset } from 'rete';
import { stringSocket } from '../sockets';

export class InputNode extends ClassicPreset.Node {
  width = 200;
  height = 120;

  constructor(initial = 'Hello World') {
    super('Input');

    this.addOutput('value', new ClassicPreset.Output(stringSocket, 'Value'));
    this.addControl(
      'value',
      new ClassicPreset.InputControl('text', { initial, placeholder: 'Enter text...' })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const control = this.controls['value'] as ClassicPreset.InputControl<'text'>;
    return { value: control.value || '' };
  }
}
