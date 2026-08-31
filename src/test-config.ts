import type { Linter } from 'eslint';

import { getCallerFile } from '@zokugun/callsite';
import fse from '@zokugun/fs-extra-plus/async';
import { isBlankString } from '@zokugun/is-it-type';
import { unwrap } from '@zokugun/xtry/unwrap';
import { Linter as ESLintLinter } from 'eslint';
import { makeRe } from 'picomatch';
import { expect, it } from 'vitest';

import { parse } from './utils/parse.js';

type Fixture = InvalidFixture | ValidFixture;

type InvalidFixture = {
	error: string | string[];
	output?: string;
} & ValidFixture;

type ValidFixture = {
	filename?: string;
	input: string;
	// languageOptions?: Record<string, Linter.LanguageOptions>;
};

export async function testConfig(config: Linter.Config[], fixturesDirectory: string): Promise<void> {
	const root = fse.parentPath(unwrap(getCallerFile()));
	const linter = new ESLintLinter({ configType: 'flat' });

	const hasExtTemplate = fixturesDirectory.includes('!!EXT!!');
	const hasNameTemplate = fixturesDirectory.includes('!!NAME!!');
	const preRe = makeRe(`${fixturesDirectory}.{json.yaml,yml}`).source;
	const filterRe = new RegExp(preRe.replace('!!NAME!!', '[^/]*[^/.]').replace('!!EXT!!', '[^/.][^/]*'));
	const namesRe = new RegExp(preRe.replace('!!NAME!!', '(?<name>[^/]*[^/.])').replace('!!EXT!!', '(?<ext>[^/.][^/]*)'));

	const files = unwrap(await fse.walk(root, {
		asPaths: true,
		collect: true,
		emptyIfDirMissing: true,
		filter: ({ path }) => filterRe.test(path),
		onlyFiles: true,
		traverseAll: true,
	}));

	for(const file of files) {
		const path = fse.join(root, file);
		const content = unwrap(await fse.readFile(path, 'utf8'));
		const fixtureResult = parse<Fixture>(content);

		if(fixtureResult.fails) {
			throw new Error(`Cannot parse "${file}"`);
		}

		const fixture = fixtureResult.value;

		let name: string;
		let filename: string;

		if(hasExtTemplate) {
			const match = namesRe.exec(file);
			if(!match) {
				throw new Error(`Cannot extract template variables for "${file}"`);
			}

			if(hasNameTemplate) {
				filename = `${match.groups!.name}.${match.groups!.ext}`;
			}
			else {
				filename = `${fse.leafName(file, 1)}.${match.groups!.ext}`;
			}

			name = filename;
		}
		else {
			name = fse.leafName(file, 1);
			filename = fixture.filename ?? name;
		}

		if(isBlankString(name)) {
			throw new Error(`Cannot find test name for "${file}"`);
		}

		if(isBlankString(filename)) {
			throw new Error(`Cannot find filename for "${file}"`);
		}

		it(name, () => {
			const { input } = fixture;
			const messages = linter.verify(input, config, { filename });
			const result = linter.verifyAndFix(input, config, { filename });

			if(isInvalidFixture(fixture)) {
				expect(messages.map(({ messageId }) => messageId)).to.eql(Array.isArray(fixture.error) ? fixture.error : [fixture.error]);

				if(fixture.output) {
					expect(result.output).to.eql(fixture.output);
				}
			}
			else {
				expect(result.output).to.eql(input);
				expect(messages.map(({ messageId }) => messageId)).to.eql([]);
			}
		});
	}
}

// function applyOptions(configs: Linter.Config[], languageOptions: Record<string, Linter.LanguageOptions> | undefined): Linter.Config[] { // {{{
// 	if(!languageOptions) {
// 		return configs;
// 	}

// 	const result: Linter.Config[] = [];

// 	for(const config of configs) {
// 		if(config.language && languageOptions[config.language]) {
// 			result.push({
// 				...config,
// 				...languageOptions[config.language],
// 			});
// 		}
// 		else {
// 			result.push(config);
// 		}
// 	}

// 	return result;
// } // }}}

function isInvalidFixture(fixture: Fixture): fixture is InvalidFixture { // {{{
	return 'error' in fixture;
} // }}}
