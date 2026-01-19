(() => { // webpackBootstrap
"use strict";
var __webpack_modules__ = ({
"mod_quiz/add_question_modal": 
/*!****************************************************************************************!*\
  !*** external "(new Promise(res => require([\"mod_quiz/add_question_modal\"], res)))" ***!
  \****************************************************************************************/
(function (module) {
module.exports = (new Promise(res => require(["mod_quiz/add_question_modal"], res)));

}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

/************************************************************************/
// webpack/runtime/create_fake_namespace_object
(() => {
var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
var leafPrototypes;
// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 16: return value when it's Promise-like
// mode & 8|1: behave like require
__webpack_require__.t = function(value, mode) {
	if(mode & 1) value = this(value);
	if(mode & 8) return value;
	if(typeof value === 'object' && value) {
		if((mode & 4) && value.__esModule) return value;
		if((mode & 16) && typeof value.then === 'function') return value;
	}
	var ns = Object.create(null);
  __webpack_require__.r(ns);
	var def = {};
	leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
	for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
		Object.getOwnPropertyNames(current).forEach((key) => { def[key] = () => (value[key]) });
	}
	def['default'] = () => (value);
	__webpack_require__.d(ns, def);
	return ns;
};
})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/rspack_version
(() => {
__webpack_require__.rv = () => ("1.4.11")
})();
// webpack/runtime/rspack_unique_id
(() => {
__webpack_require__.ruid = "bundler=rspack@1.4.11";

})();
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {

/*!****************************!*\
  !*** ./src/moodle/test.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  modal: () => (modal)
});
// import input from 'qtype_stack/input';
// import aqm from 'mod_quiz/add_question_modal'
// import aqm from '';
// import type { StackMatrixInput } from 'qtype_stack/input';

const aqm_ = Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! mod_quiz/add_question_modal */ "mod_quiz/add_question_modal")).then(function(m){
 return __webpack_require__.t(m, 22) 
})

async function modal() {
    const modal = await (await aqm_).default.create({
        scrollable: true,
    });
    modal.show();
};

// const input = await import('qtype_stack/input');
// const inputs: typeof import('qtype_stack/input') = require('qtype_stack/input');
// initInputs();
// declare const x: StackMatrixInput;
// x.;
// aqm.create({
// input.initInputs();
// });
// (async () => (await input).default.initInputs('sd', '', '', []))();
// type x = StackMatrixInputType;

})();

})()
;
//# sourceMappingURL=test.js.map