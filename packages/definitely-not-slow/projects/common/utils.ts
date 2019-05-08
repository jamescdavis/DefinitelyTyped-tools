import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

export const pathExists = promisify(fs.exists);

export function ensureExists(...pathNames: string[]): string {
  for (const pathName of pathNames) {
    if (fs.existsSync(pathName)) {
      return pathName;
    }
  }
  const pathNamesPrint = pathNames.length > 1 ? '\n' + pathNames.map(s => ` - ${s}`).join('\n') : `'${pathNames[0]}`;
  throw new Error(`File or directory does not exist: ${pathNamesPrint}`);
}

export function run(cwd: string | undefined, cmd: string): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve, reject) => {
    exec(cmd, { encoding: 'utf8', cwd }, (error, stdoutUntrimmed, stderrUntrimmed) => {
      const stdout = stdoutUntrimmed.trim();
      const stderr = stderrUntrimmed.trim();
      if (stderr !== "") {
        reject(new Error(stderr));
      } else if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export type Args = { [key: string]: string | true | number };

export function deserializeArgs(args: string[]): Args {
  const obj: Args = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith('--')) {
        obj[arg.slice(2)] = true;
      } else {
        obj[arg.slice(2)] = parseFloat(nextArg) || nextArg;
        i++;
      }
    }
  }
  return obj;
}

export function serializeArgs(args: Args): string {
  return Object.keys(args).map(arg => `--${arg}` + (args[arg] === true ? '' : args[arg].toString())).join(' ');
}
