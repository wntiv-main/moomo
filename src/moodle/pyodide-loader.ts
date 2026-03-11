import { M2WMessage, W2MMessage } from "../pyodide/protocol";
import { assertNever } from "../util";
import { EXT_URL } from "./constants";

type ScriptResult = Omit<W2MMessage & { type: 'scriptResult' }, 'type' | 'id'>;

let workerScript: string | null = null;
let worker: Worker | null = null;
let scriptId = 0;
const scriptHandlers: Record<number, (result: ScriptResult) => void> = {};

export async function runScript(script: string) {
	worker ??= await (async () => {
		workerScript ??= await (async () => {
			const data = await (await fetch(`${EXT_URL}/pyodide_worker.js`)).blob();
			return URL.createObjectURL(data);
		})();
		const worker = new Worker(workerScript, {
			// type: 'module',
			name: "Pyodide Runner Worker",
		});
		worker.addEventListener('message', e => {
			const message = e.data as W2MMessage;
			switch (message.type) {
				case 'scriptResult':
					scriptHandlers[message.id](message);
					delete scriptHandlers[message.id];
					break;
				default:
					assertNever(message.type);
			}
		});
		worker.postMessage({ type: 'pyodideInit', baseUrl: EXT_URL } satisfies M2WMessage);
		return worker;
	})();

	worker.postMessage({ type: 'runScript', script, id: ++scriptId } satisfies M2WMessage);
	const { stdout } = await new Promise<ScriptResult>(res => scriptHandlers[scriptId] = res);
	return stdout;
}
