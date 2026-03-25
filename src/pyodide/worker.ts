import { loadPyodide, version, type PyodideAPI } from 'pyodide';
import { M2WMessage, W2MMessage } from './protocol';
import { assertNever, ConstructorToType } from '../util';
import { AsyncResult } from '../asyncresult';
import { POSTINSTALL_HOOKS } from './postinstall-hooks';

let pyodidePromise: Promise<PyodideAPI> | null = null;
let pySitePackages: string = '';
let currentScriptId: number = -1;
const listenerMap = new Map<(data: string | Uint8Array<ArrayBuffer>) => void, (e: MessageEvent) => void>();

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
					mplInit(script: string, css: string) {
						postMessage({
							type: 'matplotlibInitScript',
							script: script.replace(/window\s*\.\s*mpl\s*=/, 'const mpl =')
								.replace(/class\s+MockJsWebSocket/, '$&_')
								.replaceAll(/^.*image_bytes.*$/gm, '')
								.replace(/(icon_img)\s*\.\s*src\s*=.*$/m,
									'(img => getToolbarImgUrl(image).then(url => {img.src = url;}))($1);')
								+ '\nreturn mpl;',
							css,
						} as W2MMessage);
					},
					mplPostInit(id: number, scriptId: number) {
						postMessage({
							type: 'matplotlibInitFigure',
							id,
							scriptId,
						} satisfies W2MMessage);
					},
					mplPostMessage(id: number, message: string) {
						postMessage({
							type: 'matplotlibCommand',
							message,
							id,
						} satisfies W2MMessage);
					},
					mplPostBinaryMessage(id: number, message: string | Uint8Array<ArrayBuffer>) {
						postMessage({
							type: 'matplotlibCommandBin',
							message: typeof message == 'string' ? message : message.buffer,
							id,
						} satisfies W2MMessage,
						typeof message == 'string' ? undefined : { transfer: [message.buffer] });
					},
					mplAddMessageListener(id: number, listener: (data: string | Uint8Array<ArrayBuffer>) => void) {
						const l = (e: MessageEvent) => {
							const message = e.data as M2WMessage;
							if (message.type == 'matplotlibResponse' && message.id == id)
								listener(message.message);
						};
						listenerMap.set(listener, l);
						addEventListener("message", l);
					},
					mplRemoveMessageListener(_id: number, listener: (data: string | Uint8Array<ArrayBuffer>) => void) {
						const l = listenerMap.get(listener);
						if (l) {
							removeEventListener("message", l);
							listenerMap.delete(listener);
						}
					},
					__MOOMO_SCRIPT_ID__() {
						return currentScriptId;
					},
				},
			});
			break;
		case 'runScript':
			const pyodide = await pyodidePromise!;
			currentScriptId = message.id;
			let stdout = '';
			const data = await pyodide.loadPackagesFromImports(message.script);
			console.log(data, pyodide.loadedPackages, pyodide);
			for (const pkg of data) {
				POSTINSTALL_HOOKS[pkg.name]?.(pyodide, `${pySitePackages}/${pkg.name}`);
			}
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
		case 'matplotlibResponse':
			break; // handled seperately
		case 'matplotlibRequestImage':
			postMessage({
				type: 'matplotlibImageResponse',
				name: message.name,
				data: (await pyodidePromise!).FS.readFile(
					`${pySitePackages}/matplotlib/mpl-data/images/${message.name}.png`).buffer as ArrayBuffer
			} satisfies W2MMessage);
			break;
		default:
			assertNever(message);
	}
});
