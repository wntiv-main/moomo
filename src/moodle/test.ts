// import input from 'qtype_stack/input';
// import aqm from 'mod_quiz/add_question_modal'
// import aqm from '';
// import type { StackMatrixInput } from 'qtype_stack/input';

const aqm_ = import('mod_quiz/add_question_modal')

export async function modal() {
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
