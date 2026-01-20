// stop();
const parser = new DOMParser();
let _transformDiv: HTMLElement | null = null;

function contentTransformer(content: string) {
	return content.replace(/value\s*=\s*"([^"\n]*?;"__moomo-mltex-\(";".*?";"__moomo-mltex-\)".*?)"/g, (_match, data) => {
		_transformDiv ??= document.createElement('div');
		_transformDiv.setAttribute('data-moomo-value', data);
		return `value=${_transformDiv.outerHTML.match(/<[dD][iI][vV].*?data-moomo-value=(".*").*?>/)?.[1]}`;
	});
}

declare global {
    interface Window {
        __moomo_dom_prom: () => void;
    }
}

declare function exportFunction<T extends {}>(fn: Function, obj: T, opts: { defineAs: keyof T }): void;

(async () => {
	if(!document.contentType.includes("html")) return;
	const nukeScript = document.createElement("script");
	nukeScript.text = `(${() => {
        document.writeln("<!DOCTYPE html>");
        document.writeln("<html>");
        window.__moomo_dom_prom();
    }})();`;
    const promise = new Promise<void>(res => { exportFunction(res, window, { defineAs: '__moomo_dom_prom' }) });
    document.documentElement.prepend(nukeScript);
    await promise;
	const request = fetch(location.href, {
		method: 'GET',
		priority: 'high',
		cache: 'force-cache',
	});
	const response = await request;
	const content = contentTransformer(await response.text());

	const contentType = response.headers.get("Content-Type")?.split(";")[0] as DOMParserSupportedType ?? 'text/html';
	const dom = parser.parseFromString(content, contentType);
	const oldEls = [...document.documentElement.children].filter((el) => !/^(head|body)$/i.test(el.tagName));
	document.documentElement.replaceWith(document.adoptNode(dom.documentElement));

	const root = document.documentElement;
	root.prepend(...oldEls);

	const script = document.createElement("script");
	script.id = "__moomo_bootload_script_el";
	// script.classList.add('__uclearn-skip-reload', '__uclearn-hydrate-remove');
	script.src = chrome.runtime.getURL("moodle.js");
	// script.type = "module";
	root.prepend(script);
})();
