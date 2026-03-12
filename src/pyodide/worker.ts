import { loadPyodide, type PyodideAPI } from 'pyodide';
import { M2WMessage, W2MMessage } from './protocol';
import { assertNever, ConstructorToType } from '../util';
import { AsyncResult } from '../asyncresult';

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
			(pyodide.runPythonAsync(message.script) as AsyncResult<unknown, PythonError>).then(
				() => {
					postMessage({ type: 'scriptResult', id: message.id, stdout } satisfies W2MMessage);
				},
				err => {
					postMessage({
						type: 'scriptError',
						id: message.id,
						stdout,
						error: err.message
					} satisfies W2MMessage);
				});
			break;
		default:
			assertNever(message);
	}
});
