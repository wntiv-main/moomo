import { initRequirePatching } from "./patches/hook";
import { loadScripts } from "./script-loader";

initRequirePatching();

// Load initial page scripts in expected DOM order
loadScripts(document.querySelectorAll('script:not(#__moomo_bootload_script_el)')).then(() => {
    if (DEBUG) console.log('Page considered loaded');
    window.dispatchEvent(new Event("load"));
});
