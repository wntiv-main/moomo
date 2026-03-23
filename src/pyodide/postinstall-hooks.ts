import type { PyodideAPI } from "pyodide";
import { DEBUG } from "../debug";

function patchFile(pyodide: PyodideAPI, path: string, transformer: (content: string) => string) {
	const content = transformer(pyodide.FS.readFile(path, {
		encoding: 'utf8',
	}));
	if (DEBUG) {
		console.log(`Updated content of file '${path}':`);
		console.log(content);
	}
	pyodide.FS.writeFile(path, content);
}

export const POSTINSTALL_HOOKS: Partial<Record<string, (pyodide: PyodideAPI, packagePath: string) => void>> = {
	matplotlib(pyodide, packagePath) {
		patchFile(pyodide, `${packagePath}/backends/backend_webagg.py`,
			src => src.replace(/^\s*from\s+js(?:\.\S+)?\s+import.*$|^\s*import\s+js(?:\W.*)?$/m,
					'import js\nfrom pyodide.ffi import create_proxy')
				// .replaceAll(/^\s*from\s+pyodide(?:\.\S+)?\s+import.*$|^\s*import\s+pyodide(?:\W.*)?$/gm, '')
				.replace(/^\r?\n?(\s*)def\s+initialize\(.*\):/m, `$&
$1    return
`)
				.replace(/^\r?\n?(\s*)def\s+show\(.*\):/m, `$&
$1    fignum = str(self.num)
$1    web_socket = WebAggApplication.MockPythonWebSocket(self)
$1    web_socket.open(fignum)
$1    return
`)
				.replaceAll(/,\s+js_web_socket|^\s*self\s*\.\s*js_web_socket\s*=.*/gm, '')
				.replaceAll(/self\s*\.\s*js_web_socket\s*\.\s*receive_json/g, 'js.mplPostMessage')
				.replaceAll(/self\s*\.\s*js_web_socket\s*\.\s*receive_binary/g, 'js.mplPostBinaryMessage')
				.replaceAll(/self\s*\.\s*js_web_socket\s*\.\s*open/g, 'js.mplAddMessageListener')
				.replaceAll(/^\r?\n?(\s*)self\s*\.\s*on_message_proxy\s*\.\s*destroy/gm,
					'$1js.mplRemoveMessageListener(self.on_message_proxy)\n$&')
				.replaceAll(/message\s*\.\s*as_py_json\(\)/g, 'json.loads(message)')
		);
		patchFile(pyodide, `${packagePath}/backends/backend_webagg_core.py`,
			src => src.replace(/^\s*from\s+js(?:\.\S+)?\s+import.*$|^\s*import\s+js(?:\W.*)?$/m, '')
				.replace(/^\s*from\s+pyodide(?:\.\S+)?\s+import\s+\([^]*?\)/m, '')
				.replace(/^\r?\n?(\s*)def\s+handle_save\(.*\):/m, `$&
$1    return # TODO
`));
	},
};
