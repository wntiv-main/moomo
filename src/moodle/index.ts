import { DEBUG } from "../debug";
import { initRequirePatching } from "./patches/hook";
import { loadScripts } from "./script-loader";

initRequirePatching();

// Load initial page scripts in expected DOM order
loadScripts(document.querySelectorAll('script:not(#__moomo_bootload_script_el)')).then(() => {
    if (DEBUG) console.log('Page considered loaded');
    const nav = document.querySelector('.navbar');
    nav?.classList.add('navbar-dark');
    nav?.classList.remove('navbar-light');
    window.dispatchEvent(new Event("load"));
});
document.documentElement.classList.add('__moomo-dark');
