import { EventEmitter } from 'node:events';
import sinon from 'sinon';

export class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = sinon.stub();
}
