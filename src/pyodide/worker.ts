import { loadPyodide, type PyodideAPI, version } from 'pyodide';
import { M2WMessage, W2MMessage } from './protocol';
import { assertNever } from '../util';

console.log('woke');
debugger;

let pyodidePromise: Promise<PyodideAPI> | null = null;

addEventListener('message', async e => {
	const message = e.data as M2WMessage;
	switch (message.type) {
		case 'pyodideInit':
			pyodidePromise = loadPyodide({
				indexURL: `${message.baseUrl}/pyodide`,
			});
			break;
		case 'runScript':
			const pyodide = await pyodidePromise!;
			let stdout = '';
			pyodide.setStdout({
				batched(output) {
					stdout += output;
				},
			});
			await pyodide.runPythonAsync(message.script);
			postMessage({ type: 'scriptResult', id: message.id, stdout } satisfies W2MMessage);
			break;
		default:
			assertNever(message);
	}
});
