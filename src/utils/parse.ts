/* eslint-disable ts/no-unsafe-return */

import type { DResult } from '@zokugun/xtry';

import { err, stringifyError, xtry } from '@zokugun/xtry/sync';
import YAML from 'yaml';

export function parse<T>(data: string): DResult<T> {
	const json = parseJSON<T>(data);

	if(!json.fails) {
		return json;
	}

	return parseYAML<T>(data);
}

function parseJSON<T>(data: string): DResult<T> {
	const result = xtry<T>(() => JSON.parse(data));

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return result;
}

function parseYAML<T>(data: string): DResult<T> {
	const result = xtry<T>(() => YAML.parse(data));

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return result;
}
