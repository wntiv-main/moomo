import type {
    StackInput, StackSimpleInput, StackTextareaInput, StackRadioInput,
    StackCheckboxInput, StackMatrixInput } from 'qtype_stack/input';

declare const _StackInput: typeof StackInput;
const __StackInput = (...args: Parameters<typeof StackInput>) => new _StackInput(...args);
export type StackInput = ReturnType<typeof __StackInput>
export interface StackInputCtor { (this: StackInput, ...args: Parameters<typeof _StackInput>): void; new(...args: Parameters<typeof _StackInput>): StackInput; }
export type StackInputCtor_ = (this: StackInput, ...args: Parameters<typeof _StackInput>) => void;

declare const _StackSimpleInput: typeof StackSimpleInput;
const __StackSimpleInput = (...args: Parameters<typeof StackSimpleInput>) => new _StackSimpleInput(...args);
export type StackSimpleInput = ReturnType<typeof __StackSimpleInput>
export interface StackSimpleInputCtor { (this: StackSimpleInput, ...args: Parameters<typeof _StackSimpleInput>): void; new(...args: Parameters<typeof _StackSimpleInput>): StackSimpleInput; }
export type StackSimpleInputCtor_ = (this: StackSimpleInput, ...args: Parameters<typeof _StackSimpleInput>) => void;

declare const _StackTextareaInput: typeof StackTextareaInput;
const __StackTextareaInput = (...args: Parameters<typeof StackTextareaInput>) => new _StackTextareaInput(...args);
export type StackTextareaInput = ReturnType<typeof __StackTextareaInput>
export interface StackTextareaInputCtor { (this: StackTextareaInput, ...args: Parameters<typeof _StackTextareaInput>): void; new(...args: Parameters<typeof _StackTextareaInput>): StackTextareaInput; }
export type StackTextareaInputCtor_ = (this: StackTextareaInput, ...args: Parameters<typeof _StackTextareaInput>) => void;

declare const _StackRadioInput: typeof StackRadioInput;
const __StackRadioInput = (...args: Parameters<typeof StackRadioInput>) => new _StackRadioInput(...args);
export type StackRadioInput = ReturnType<typeof __StackRadioInput>
export interface StackRadioInputCtor { (this: StackRadioInput, ...args: Parameters<typeof _StackRadioInput>): void; new(...args: Parameters<typeof _StackRadioInput>): StackRadioInput; }
export type StackRadioInputCtor_ = (this: StackRadioInput, ...args: Parameters<typeof _StackRadioInput>) => void;

declare const _StackCheckboxInput: typeof StackCheckboxInput;
const __StackCheckboxInput = (...args: Parameters<typeof StackCheckboxInput>) => new _StackCheckboxInput(...args);
export type StackCheckboxInput = ReturnType<typeof __StackCheckboxInput>
export interface StackCheckboxInputCtor { (this: StackCheckboxInput, ...args: Parameters<typeof _StackCheckboxInput>): void; new(...args: Parameters<typeof _StackCheckboxInput>): StackCheckboxInput; }
export type StackCheckboxInputCtor_ = (this: StackCheckboxInput, ...args: Parameters<typeof _StackCheckboxInput>) => void;

declare const _StackMatrixInput: typeof StackMatrixInput;
const __StackMatrixInput = (...args: Parameters<typeof StackMatrixInput>) => new _StackMatrixInput(...args);
export type StackMatrixInput = ReturnType<typeof __StackMatrixInput>
export interface StackMatrixInputCtor { (this: StackMatrixInput, ...args: Parameters<typeof _StackMatrixInput>): void; new(...args: Parameters<typeof _StackMatrixInput>): StackMatrixInput; }
export type StackMatrixInputCtor_ = (this: StackMatrixInput, ...args: Parameters<typeof _StackMatrixInput>) => void;
