import { getCallerFile } from '@zokugun/callsite';
import fse from '@zokugun/fs-extra-plus/path';
import { unwrap } from '@zokugun/xtry/unwrap';

export function getCallerPath(path: string): string {
	const callerFile = unwrap(getCallerFile());

	return fse.resolve(fse.parentPath(callerFile), path);
}
