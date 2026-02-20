import { DEBUG } from "../debug";
import { initRequirePatching } from "./patches/hook";
import { loadScripts } from "./script-loader";

let  _readyState = 'complete';
// override document.readyState to match custom loading procedure, fixing some scripts (tinymce)
Object.defineProperty(document, 'readyState', { get: () => _readyState });
initRequirePatching();

// Load initial page scripts in expected DOM order
loadScripts(document.querySelectorAll('script:not(#__moomo_bootload_script_el)')).then(() => {
	if (DEBUG) console.log('Page considered loaded');
	const nav = document.querySelector('.navbar');
	nav?.classList.add('navbar-dark');
	nav?.classList.remove('navbar-light');
	window.dispatchEvent(new Event("load"));
	
	if (nav) {
		const observer = new ResizeObserver((es) => {
			for (const evt of es)
				document.documentElement.style.setProperty("--moomo-nav-height", `${evt.contentRect.height}px`);
		});
		observer.observe(nav);
	}
	_readyState = 'interactive';
});
document.documentElement.classList.add('__moomo-dark');
document.documentElement.dataset.bsTheme = 'dark';
