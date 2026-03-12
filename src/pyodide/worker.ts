import { loadPyodide, type PyodideAPI } from 'pyodide';
import { M2WMessage, W2MMessage } from './protocol';
import { assertNever, ConstructorToType } from '../util';

let pyodidePromise: Promise<PyodideAPI> | null = null;

type PythonErrorCtor = PyodideAPI['ffi']['PythonError'];
type PythonError = ConstructorToType<PythonErrorCtor>;

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
					stdout += output + '\n';
				},
			});
			await (pyodide.runPythonAsync(message.script)).catch((err: PythonError) => {
				postMessage({ type: 'scriptError', id: message.id, stdout, error: err. } satisfies W2MMessage);
			});
			postMessage({ type: 'scriptResult', id: message.id, stdout } satisfies W2MMessage);
			break;
		default:
			assertNever(message);
	}
});
