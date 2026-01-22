import { MathfieldElement } from "mathlive";

import type { Hook } from './hook'
import type { StackMatrixInputCtor, StackMatrixInputCtor_, StackSimpleInputCtor } from '../types/stack';
import { tailHookClean } from './patch';
import { latexToStack } from "../../latex-parser";
import { DEBUG } from "../../debug";
import { isElementTag } from "../domutil";
import { EXT_URL } from "../constants";

MathfieldElement.soundsDirectory = null;
MathfieldElement.fontsDirectory = `${EXT_URL}/mathlive/fonts/`;

function initMathField(mf: MathfieldElement) {
	const styleOverrides = document.createElement('style');
	styleOverrides.textContent = `
		:host .ML__caret {
			display: inline-flex;
			align-items: center;
			vertical-align: middle;
		}

		:host .ML__caret::after {
			position: absolute;
			height: 1lh;
			inset: auto;
		}

		:host .ML__prompt {
			margin-top: 0.2em;
		}
	`;
	mf.shadowRoot?.append(styleOverrides);
	mf.removeExtraneousParentheses = true;
	mf.smartFence = true;
	mf.smartSuperscript = true;
	// mf.classList.add(MATHLIVE_FIELD_CLASS);
	mf.addEventListener('mount', () => {
		const menu = mf.menuItems.filter(item => !/color|variant|decoration/.test((item as { id?: string; }).id ?? ''));
		menu.push({
			type: 'command',
			label: 'Toggle STACK field',
			visible: (modifiers) => modifiers.shift,
			id: 'moomo-debug',
			onMenuSelect: () => mf.classList.toggle('__uclearn-mathlive-debug'),
		});
		mf.menuItems = menu;
		mf.keybindings = [
			...mf.keybindings,
			{ key: 'alt+,', ifMode: 'math', command: 'addColumnAfter' },
			{ key: 'shift+alt+,', ifMode: 'math', command: 'addColumnBefore' },
			{ key: 'alt+;', ifMode: 'math', command: 'addRowAfter' },
			{ key: 'shift+alt+;', ifMode: 'math', command: 'addRowBefore' },
		];
		mf.inlineShortcuts = {
			...mf.inlineShortcuts,
			pd: '\\operatorname{pd}',
			implies: '\\rightarrow',
			xnor: '\\leftrightarrow',
			'<-': '\\leftarrow',
			'->': '\\rightarrow',
			'<->': '\\leftrightarrow',
		};
	});
	return (mf as unknown as { _internals: ElementInternals; })._internals;
}

const stackInputPatch: Hook<'qtype_stack/input'> = (ready) => {
	const patchedCtors: Partial<[StackSimpleInputCtor, StackMatrixInputCtor]> = [,,];

	return tailHookClean(ready, (mod, _, StackMatrixInput: StackMatrixInputCtor) => {
		patchedCtors[0] = function (input: HTMLInputElement) {
			const mathField = new MathfieldElement({
				contentPlaceholder: input.placeholder,
			});
			mathField.readOnly = input.readOnly;
			const internals = initMathField(mathField);

			const fieldValue = input.value.match(/;"__moomo-mltex-\(";(".*");"__moomo-mltex-\)"/);
			mathField.setValue(fieldValue ? JSON.parse(fieldValue[1]) : ''/* AMTparseAMtoTeX(field.value.split(';')[0]) */);
			mathField.style.minWidth = input.style.minWidth || input.style.width;

			this.getValue = () => input.value;
			this.addEventHandlers = valueChanging => {
				const inputCb = (e: Event) => {
					const fieldLatex = mathField.getValue('latex');
					const [stack, err] = latexToStack(fieldLatex);
					if (err) {
						mathField.style.borderColor = 'red';
						if (DEBUG) console.error(err);
						internals.setValidity({ customError: true }, err.message);
						return;
					}
					internals.setValidity({});
					mathField.style.borderColor = 'currentColor';
					input.value = `${stack};"__moomo-mltex-(";${JSON.stringify(fieldLatex)};"__moomo-mltex-)"`;
					valueChanging();
				};
				mathField.addEventListener('input', inputCb);
				// mathField.addEventListener('change', inputCb);
			}
			this.dispatchEvent = e => input.dispatchEvent(e);
			input.before(mathField);
			input.style.display = 'none';
		} as StackSimpleInputCtor;

		patchedCtors[1] = function (idPrefix, container) {
			StackMatrixInput.call(this, idPrefix, container);

			const mathField = new MathfieldElement({});
			const internals = initMathField(mathField);
			const rows = [...container.querySelectorAll('tr')];
			// const env = field.classList.contains('matrixroundbrackets') ? 'pmatrix'
			// 	: field.classList.contains('matrixsquarebrackets') ? 'bmatrix'
			// 		: field.classList.contains('matrixbarbrackets') ? 'vmatrix'
			// 			: 'matrix';
			console.log(idPrefix, container);
			const env = 'bmatrix'; // TODO

			mathField.readOnly = true;
			mathField.style.borderColor = 'transparent';
			const lockStates: Record<string, boolean> = {};

			const values: string[][] = [];

			mathField.setValue(`\
				\\begin{${env}}
					${rows.map(row => {
				const vals: string[] = [];
				values.push(vals);
				const cells = [...row.querySelectorAll<HTMLInputElement>('td > input[data-stack-input-type="matrix"]')];
				return cells.map(cell => {
					vals.push(cell.value);
					const fieldValue = cell.value.match(/;"__moomo-mltex-\(";(".*");"__moomo-mltex-\)"/);
					const cellValue = fieldValue ? JSON.parse(fieldValue[1]) : ''/* AMTparseAMtoTeX(cell.value.split(';')[0]) */;
					lockStates[cell.id] = cell.readOnly;
					return `\\placeholder[${cell.id}]{${cellValue}}`;
				}).join('&');
			}).join('\\\\')}
				\\end{${env}}`);

			mathField.addEventListener("mount", () => {
				for (const [id, locked] of Object.entries(lockStates)) mathField.setPromptState(id, undefined, locked);
			});

			this.addEventHandlers = valueChanging => {
				const inputCb = (e: Event) => {
					for (const prompt of mathField.getPrompts()) {
						const fieldLatex = mathField.getPromptValue(prompt, 'latex');
						const field = document.getElementById(prompt);
						if (!field || !isElementTag(field, 'input')) continue;
						const [stack, err] = latexToStack(fieldLatex);
						if (err) {
							mathField.style.borderColor = 'red';
							internals.setValidity({ customError: true }, err.message);
							return;
						}
						field.value = `${stack};"__uclearn-mltex-(";${JSON.stringify(fieldLatex)};"__uclearn-mltex-)"`;
						const [row, col] = field.name.substring(idPrefix.length + 5).split('_');
						values[+row][+col] = field.value;
					}
					internals.setValidity({});
					mathField.style.borderColor = 'transparent';
					valueChanging();
				};
				mathField.addEventListener('input', inputCb);
				mathField.addEventListener('change', inputCb);
			}
			
			this.getValue = () => JSON.stringify(values);
			this.dispatchEvent = e => container.dispatchEvent(e);
		} satisfies StackMatrixInputCtor_ as StackMatrixInputCtor;

		return mod;
	}, ['StackMatrixInput'] as const, { patchedCtors }, undefined,
	code => code.replace(/function\s+getInputTypeHandler\s*\([^]*?\)\s*\{/, '$&const [StackSimpleInput, StackMatrixInput] = patchedCtors;'))
}

export default stackInputPatch;
