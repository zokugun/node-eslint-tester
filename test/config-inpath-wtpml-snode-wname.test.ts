import mdPlugin from '@eslint/markdown';

import { testConfig } from '../src/index.js';

await testConfig(
	[
		{
			plugins: {
				md: mdPlugin,
			},
		},
		{
			files: ['**/*.md'],
			language: 'md/gfm',
			languageOptions: {
				frontmatter: 'yaml',
			},
			rules: {
				'md/fenced-code-language': 'error',
			},
		},
	],
	'fixtures/config/inpath-wtpml-snode/!!EXT!!-!!NAME!!*',
);
