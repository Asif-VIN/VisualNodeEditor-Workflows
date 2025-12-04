import { ClassicPreset } from 'rete';
import { anySocket } from '../sockets';

export class OutputNode extends ClassicPreset.Node {
  width = 200;
  height = 100;

  constructor() {
    super('Output');

    this.addInput('value', new ClassicPreset.Input(anySocket, 'Value'));
  }

  data(inputs: Record<string, any>): Record<string, any> {
    return {
      value: inputs['value']?.[0] || ''
    };
  }
}
