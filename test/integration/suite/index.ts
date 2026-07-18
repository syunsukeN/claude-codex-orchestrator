import * as path from 'path';
import Mocha from 'mocha';
import { globSync } from 'glob';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 60000
  });

  const testsRoot = path.resolve(__dirname, '.');

  return new Promise((resolve, reject) => {
    const files = globSync('**/*.test.js', { cwd: testsRoot });

    files.forEach((file) => mocha.addFile(path.resolve(testsRoot, file)));

    try {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
