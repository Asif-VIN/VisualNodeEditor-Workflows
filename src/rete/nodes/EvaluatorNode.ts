import { ClassicPreset } from 'rete';
import { stringSocket, jsonSocket } from '../sockets';

export class EvaluatorNode extends ClassicPreset.Node {
  width = 250;
  height = 160;

  constructor() {
    super('Evaluator');

    this.addInput('query', new ClassicPreset.Input(stringSocket, 'Query'));
    this.addInput('answer', new ClassicPreset.Input(stringSocket, 'Answer'));
    this.addOutput('score', new ClassicPreset.Output(stringSocket, 'Score'));
    this.addOutput('feedback', new ClassicPreset.Output(jsonSocket, 'Feedback'));

    this.addControl(
      'rubricName',
      new ClassicPreset.InputControl('text', { initial: 'accuracy', placeholder: 'Rubric Name' })
    );
  }

  data(inputs: Record<string, any>): Record<string, any> {
    const rubricControl = this.controls['rubricName'] as ClassicPreset.InputControl<'text'>;

    return {
      query: inputs['query']?.[0] || '',
      answer: inputs['answer']?.[0] || '',
      rubricName: rubricControl.value || 'accuracy'
    };
  }
}
