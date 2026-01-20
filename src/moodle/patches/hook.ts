import { stackInputPatch } from './stack-fields';

type ModuleTypesMap = {
    "qtype_stack/input": typeof import('qtype_stack/input');

	// "media_videojs/video-lazy": typeof VideoJS;
	// "core/modal_registry": typeof import('core/modal_save_cancel');
	"core/modal_events": typeof import('core/modal_events');
	"core/toast": typeof import('core/toast');
	// "filter_ace_inline/ace_inline_code": {
	// 	initAceHighlighting(config: unknown & object): PromiseLike<void>;
	// 	initAceInteractive(config: unknown & { button_label: string; }): PromiseLike<void>;
	// };
	"block_recentlyaccessedcourses/main": typeof import('block_recentlyaccessedcourses/main');
	// 'vs/editor/editor.main': null;
	// 'qtype_coderunner/ui_ace_gapfiller': {
	// 	Constructor: AceGapfillerUiCtor;
	// };
	// 'moodle-core-notification-dialogue': undefined;
	'core/popover_region_controller': typeof import('core/popover_region_controller');
	// 'message_popup/notification_popover_controller': NotificationPopoverControllerType;
	'core_message/message_popover': typeof import ('core_message/message_popover');
	'core_message/message_drawer': typeof import('core_message/message_drawer');
}

export type RequireFunctionDeps<T extends (keyof ModuleTypesMap)[]> = { [K in keyof T]: ModuleTypesMap[T[K]] };

export type DefineArgs<K extends keyof ModuleTypesMap = keyof ModuleTypesMap, D extends (keyof ModuleTypesMap)[] = (keyof ModuleTypesMap)[]> =
    | [config: { [key: string]: unknown; }]
    | [func: () => unknown]
    | [ready: (...deps: RequireFunctionDeps<D>) => unknown]
    | [ready: (require: Require, exports: { [key: string]: unknown; }, module: RequireModule) => unknown]
    | [name: K, deps: D, (...deps: RequireFunctionDeps<D>) => ModuleTypesMap[K]]
    | [name: K, () => ModuleTypesMap[K]];

export type Hook<K  extends keyof ModuleTypesMap> = <Deps extends (keyof ModuleTypesMap)[]>(
        ready: (...deps: RequireFunctionDeps<Deps>) => ModuleTypesMap[K],
        deps: Deps,
        name: K,
        version?: string,
    ) => undefined | ((...deps: RequireFunctionDeps<Deps>) => ModuleTypesMap[K])
        | PromiseLike<undefined | ((...deps: RequireFunctionDeps<Deps>) => ModuleTypesMap[K])>;

const HOOKS: {
    [K in keyof ModuleTypesMap]?: Hook<K>
} = {
    "qtype_stack/input": stackInputPatch,
};

declare global {
	interface Window {
        __moomo_requirejs_promise?: Promise<Require>;
        __moomo_requirejs_ready?: (require: Require) => void;
	}
}

let _require_promise: Promise<Require>;
export async function getRequire() {
	return (
		typeof window.require === 'function' ? window.require :
			// biome-ignore lint/suspicious/noAssignInExpressions: shhh
			(await (_require_promise ??= new Promise((res) => {
				let _require: Require | undefined = undefined;
				Object.defineProperty(window, "require", {
					get() {
						return _require;
					},
					set(value) {
						_require = value;
						if (typeof _require === 'function') {
                            res(_require);
                            // This allows external moodle module imports to resolve
                            window.__moomo_requirejs_promise ??= Promise.resolve(_require);
                            window.__moomo_requirejs_ready?.(_require);
                        }
					},
				});
			})))
	);
}

function patchDefine(define: RequireDefine) {
    return new Proxy(define, {
        apply(target, thisArg, argArray) {
            const args = argArray as DefineArgs;
            if (!(typeof args[0] === 'string')) return Reflect.apply(target, thisArg, argArray);
            let name: keyof ModuleTypesMap = argArray[0];
            let deps: (keyof ModuleTypesMap)[];
            let ready: (..._deps: RequireFunctionDeps<typeof deps>) => ModuleTypesMap[typeof name];
            if (argArray.length === 2) {
                [name, ready] = argArray;
                deps = [];
            } else[name, deps, ready] = argArray;
            const result = HOOKS[name]?.(ready as never, deps, name as never);
            if(result && 'then' in result) return result.then(r => Reflect.apply(target, thisArg, [name, deps, r ?? ready]));
            else Reflect.apply(target, thisArg, [name, deps, result ?? ready]);
        }
    });
}

function patchYUIDefine(define: typeof YUI.add) {
    return new Proxy(define, {
        apply(target, thisArg, argArray) {
            const [name, fn, version, details = undefined] = argArray as Parameters<typeof YUI.add>;
            const ready = HOOKS[name as keyof ModuleTypesMap]?.(fn as never, (details?.requires ?? []) as (keyof ModuleTypesMap)[], name as never, version) ?? fn;
            return Reflect.apply(target, thisArg, [name, ready, version, details]);
        }
    });
}

export function initRequirePatching() {
    getRequire().then(() => { window.define = patchDefine(window.define); });
}
