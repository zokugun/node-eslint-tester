import type { InvalidTestCase, RuleTesterConfig, TestLanguageOptions, ValidTestCase } from '@typescript-eslint/rule-tester';
import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';
import type { Globber } from '@zokugun/fs-extra-plus';
import type { Rule } from 'eslint';

import { RuleTester } from '@typescript-eslint/rule-tester';
import { getCallerFile } from '@zokugun/callsite';
import fse from '@zokugun/fs-extra-plus/async';
import { unwrap } from '@zokugun/xtry/unwrap';
import { afterAll, describe, it } from 'vitest';

import { parse } from './utils/parse.js';

RuleTester.afterAll = afterAll;
// eslint-disable-next-line ts/strict-void-return
RuleTester.describe = describe;
RuleTester.it = it;

type Fixture = InvalidFixture | ValidFixture;

type InvalidFixture = {
	error: string | string[];
	output: string;
} & ValidFixture;

type ValidFixture = {
	filename?: string;
	input: string;
	languageOptions?: TestLanguageOptions;
	options?: unknown[];
	rule: string;
};

export async function testRules(rules: Record<string, Rule.RuleModule>, fixturesDirectory: string, testerConfig?: RuleTesterConfig): Promise<void> {
	const root = fse.parentPath(unwrap(getCallerFile()));

	const tester = new RuleTester({
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
		},
		...testerConfig,
	});

	const hasTemplate = fixturesDirectory.includes('!!RULE!!');
	const pattern = hasTemplate ? fixturesDirectory.replace('!!RULE!!', '*') : fixturesDirectory;

	const files = unwrap(await fse.walk(root, {
		asPaths: true,
		collect: true,
		emptyIfDirMissing: true,
		glob: fse.gb.pico([`${pattern}.{json.yaml,yml}`]),
		onlyFiles: true,
		traverseAll: true,
	}));

	const tests: Record<string, { invalid: Array<InvalidTestCase<string, unknown[]>>; valid: Array<ValidTestCase<unknown[]>> }> = {};

	const ruleDirectories: Array<{ match: Globber; name: string }> = [];

	if(hasTemplate) {
		for(const ruleName of Object.keys(rules)) {
			const rulePath = fse.gb.pico([fixturesDirectory.replace('!!RULE!!', ruleName)]);

			ruleDirectories.push({
				match: rulePath,
				name: ruleName,
			});
		}
	}

	for(const file of files) {
		const path = fse.join(root, file);
		const content = unwrap(await fse.readFile(path, 'utf8'));
		// const fixtureResult = parse<Fixture>(content);

		// if(fixtureResult.fails) {
		// 	throw new Error(`Cannot parse "${file}"`);
		// }

		// const fixture = fixtureResult.value;
		const fixture = unwrap(parse<Fixture>(content), () => new Error(`Cannot parse "${file}"`));

		const name = fse.leafName(file, 1);
		const rule = hasTemplate ? ruleDirectories.find(({ match }) => match(file))?.name : fixture.rule;

		if(!rule) {
			throw new Error(`Cannot find rule for "${file}"`);
		}

		tests[rule] ??= { invalid: [], valid: [] };

		if(isInvalidFixture(fixture)) {
			tests[rule].invalid.push({
				name,
				code: fixture.input,
				output: fixture.output,
				errors: (Array.isArray(fixture.error) ? fixture.error : [fixture.error]).map((messageId) => ({ messageId })),
				...(fixture.options ? { options: fixture.options } : { options: [] }),
				...(fixture.languageOptions ? { languageOptions: fixture.languageOptions } : {}),
				...('filename' in fixture ? { filename: fixture.filename } : {}),
			});
		}
		else {
			tests[rule].valid.push({
				name,
				code: fixture.input,
				...(fixture.options ? { options: fixture.options } : {}),
				...(fixture.languageOptions ? { languageOptions: fixture.languageOptions } : {}),
				...('filename' in fixture ? { filename: fixture.filename } : {}),
			});
		}
	}

	for(const [ruleName, { invalid, valid }] of Object.entries(tests)) {
		const rule = rules[ruleName] as unknown as RuleModule<string, unknown[]>;

		tester.run<string, unknown[]>(ruleName, rule, { invalid, valid });
	}
}

function isInvalidFixture(fixture: Fixture): fixture is InvalidFixture { // {{{
	return 'error' in fixture;
} // }}}
