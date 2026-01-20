import { DEBUG } from '../debug';
import { LazyPromise } from '../util';

const aqm_ = LazyPromise.wrap(() => import('mod_quiz/add_question_modal'))

export async function modal() {
    const modal = await (await aqm_).default.create({
        scrollable: true,
    });
    if (DEBUG) console.log(modal);
    modal.show();
};
