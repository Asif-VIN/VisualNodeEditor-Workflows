import { ClassicPreset } from 'rete';
import { jsonSocket, toolCallSocket } from '../sockets';

export class ToolCallNode extends ClassicPreset.Node {
  width = 250;
  height = 160;

  constructor() {
    super('Tool Call');

    this.addInput('request', new ClassicPreset.Input(toolCallSocket, 'Request'));
    this.addOutput('response', new ClassicPreset.Output(jsonSocket, 'Response'));

    this.addControl(
      'toolName',
      new ClassicPreset.InputControl('text', { initial: 'search', placeholder: 'Tool Name' })
    );
    this.addControl(
      'parameters',
      new ClassicPreset.InputControl('text', {
        initial: JSON.stringify({ query: '' }, null, 2),
        placeholder: 'Parameters (JSON)'
      })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const toolControl = this.controls['toolName'] as ClassicPreset.InputControl<'text'>;
    const paramsControl = this.controls['parameters'] as ClassicPreset.InputControl<'text'>;

    return {
      request: inputs['request']?.[0] || {},
      toolName: toolControl.value || 'search',
      parameters: paramsControl.value || '{}'
    };
  }
}
