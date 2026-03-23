import { loadPyodide, version, type PyodideAPI } from 'pyodide';
import { M2WMessage, W2MMessage } from './protocol';
import { assertNever, ConstructorToType } from '../util';
import { AsyncResult } from '../asyncresult';
import { POSTINSTALL_HOOKS } from './postinstall-hooks';

let pyodidePromise: Promise<PyodideAPI> | null = null;
let pySitePackages: string = '';
const listenerMap = new Map<(data: string | Uint8Array) => void, (e: MessageEvent) => void>();

type PythonErrorCtor = PyodideAPI['ffi']['PythonError'];
type PythonError = ConstructorToType<PythonErrorCtor>;

addEventListener('message', async e => {
	const message = e.data as M2WMessage;
	switch (message.type) {
		case 'pyodideInit':
			pyodidePromise = loadPyodide({
				// indexURL: `${message.baseUrl}/pyodide`,
				// stdLibURL: `${message.baseUrl}/pyodide/python_stdlib.zip`,
				indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
				async fsInit(_FS, info) {
					pySitePackages = info.sitePackages;
				},
				jsglobals: {
					// matplotlib utils
					mplPostMessage(message: string) {
						postMessage({
							type: 'matplotlibCommand',
							message,
						} satisfies W2MMessage);
					},
					mplPostBinaryMessage(message: string | Uint8Array) {
						postMessage({
							type: 'matplotlibCommandBin',
							message,
						} satisfies W2MMessage,
						typeof message == 'string' ? undefined : { transfer: [message] });
					},
					mplAddMessageListener(listener: (data: string | Uint8Array) => void) {
						const l = (e: MessageEvent) => {
							listener(e.data);
						};
						listenerMap.set(listener, l);
						addEventListener("message", l);
					},
					mplRemoveMessageListener(listener: (data: string | Uint8Array) => void) {
						const l = listenerMap.get(listener);
						if (l) {
							removeEventListener("message", l);
							listenerMap.delete(listener);
						}
					},
				},
			});
			break;
		case 'runScript':
			const pyodide = await pyodidePromise!;
			let stdout = '';
			const data = await pyodide.loadPackagesFromImports(message.script);
			console.log(data, pyodide.loadedPackages, pyodide);
			for (const pkg of data) {
				POSTINSTALL_HOOKS[pkg.name]?.(pyodide, `${pySitePackages}/${pkg.name}`);
			}
			// const canvas = new OffscreenCanvas(0, 0);
			// pyodide.canvas.setCanvas2D({
			// 	get width() { return canvas.width; },
			// 	get height() { return canvas.height; },
			// 	set width(v) { canvas.width = v; },
			// 	set height(v) { canvas.height = v; },
			// 	getContext(type: '2d') {
			// 		return canvas.getContext(type);
			// 	},
			// });
			if (message.stdin) {
				const stdin = [message.stdin];
				pyodide.setStdin({
					stdin: () => stdin.shift(),
					isatty: false,
				});
			} else {
				pyodide.setStdin({
					stdin: () => prompt(stdout),
					isatty: true,
				});
			}
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
					} satisfies W2MMessage, { transfer: [] });
				});
			break;
		default:
			assertNever(message);
	}
});
