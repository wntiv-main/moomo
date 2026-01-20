import { defineConfig } from '@rspack/cli';
import { DefinePlugin } from '@rspack/core';

const packages = [
    'core',
    'core_admin',
    'core_ai',
    'core_availability',
    'core_backup',
    'core_badges',
    'core_block',
    'block_accessreview',
    'block_myoverview',
    'block_navigation',
    'block_online_users',
    'block_private_files',
    'block_recentlyaccessedcourses',
    'block_recentlyaccesseditems',
    'block_settings',
    'block_site_main_menu',
    'block_starredcourses',
    'block_timeline',
    'core_calendar',
    'core_cohort',
    'core_comment',
    'core_communication',
    'core_contentbank',
    'core_course',
    'core_customfield',
    'customfield_number',
    'enrol_guest',
    'enrol_lti',
    'enrol_manual',
    'enrol_self',
    'core_filters',
    'filter',
    'filter_glossary',
    'filter_mathjaxloader',
    'core_grades',
    'core_grades',
    'gradingform_guide',
    'gradingform_rubric',
    'gradepenalty_duedate',
    'gradereport_grader',
    'gradereport_singleview',
    'gradereport_user',
    'core_group',
    'core_h5p',
    'media_videojs',
    'core_message',
    'mod_assign',
    'mod_bigbluebuttonbn',
    'mod_data',
    'mod_feedback',
    'mod_folder',
    'mod_forum',
    'forumreport_summary',
    'mod_lti',
    'mod_quiz',
    'quizaccess_seb',
    'quiz_overview',
    'mod_workshop',
    'core_payment',
    'paygw_paypal',
    'core_question',
    'qbank_bulkmove',
    'qbank_columnsortorder',
    'qbank_comment',
    'qbank_deletequestion',
    'qbank_editquestion',
    'qbank_managecategories',
    'qbank_previewquestion',
    'qbank_tagquestion',
    'qbank_usage',
    'qbank_viewquestiontext',
    'qbank_viewquestiontype',
    'qtype_ddimageortext',
    'qtype_ddmarker',
    'qtype_ddwtos',
    'qtype_multianswer',
    'qtype_multichoice',
    'qtype_stack',
    'report_competency',
    'report_insights',
    'report_participation',
    'report_progress',
    'core_reportbuilder',
    'core_search',
    'core_sms',
    'theme_boost',
    'core_user',
];

export default function config(env: Partial<Record<string, true | string>>, argv: Object) {
    return defineConfig({
        entry: {
            // test: './src/moodle/modal.ts',
            moodle: './src/moodle/index.ts',
            moodle_bootload: './src/moodle/bootload.ts',
            // timetable: './src/timetable/index.ts',
        },
        mode: env.dev ? 'development' : 'production',
        plugins: [
            new DefinePlugin({
                'DEBUG': env.dev ? 'true' : 'false',
            }),
        ],
        // output: {
        //     // library: {
        //     //     type: 'amd',
        //     // },
        // },
        // devtool: env.dev ? 'eval-source-map' : undefined,
        externals: [
            ({ request }, callback) => request && packages.includes(request.split('/')[0])
                ? callback(undefined,
                    `(new Promise(async (res) =>
                        (window.require && typeof window.require === 'function' ? window.require
                        : await (window.__moomo_requirejs_promise
                            ??= new Promise(res => { window.__moomo_requirejs_ready = res })))
                        ([${JSON.stringify(request)}], res)))`.replaceAll(/\s+/g, ' '), 'promise') : callback(),
        ],
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.ts$/, // Match .ts files
                    exclude: [/node_modules/],
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript', // Specify the syntax as typescript
                            },
                        },
                    },
                    type: 'javascript/auto', // Ensures correct module handling
                },
            ],
        }
    });
};
