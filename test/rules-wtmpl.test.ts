import mdPlugin from '@eslint/markdown';

import { testRules } from '../src/index.js';

await testRules(mdPlugin.rules, 'fixtures/rules/wtmpl/!!RULE!!/*', {
	language: 'md/gfm',
	plugins: {
		md: mdPlugin,
	},
});
