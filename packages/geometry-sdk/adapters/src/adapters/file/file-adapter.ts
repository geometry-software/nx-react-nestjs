import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { FileModel } from './file-model.js';

const FILE_SUFFIX = '.data.ts';
const EXPORT_PREFIX = 'export const fileData = ';

/** Stores one serialized model at a fixed path. */
export class SimpleFileAdapter<Meta extends object, Data> {
  private readonly path: string;

  constructor(filePath: string, fileSuffix = FILE_SUFFIX) {
    if (!fileSuffix.startsWith('.') || !/^\.[a-zA-Z0-9.]+$/.test(fileSuffix)) {
      throw new Error('File suffix must start with a dot and contain only letters, digits, or dots.');
    }
    this.path = filePath.endsWith(fileSuffix) ? filePath : `${filePath}${fileSuffix}`;
  }

  /** Atomically saves the model to this adapter's file. */
  public async save(model: FileModel<Meta, Data>): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const temporary = `${this.path}.${randomUUID()}.tmp`;
    const source = `${EXPORT_PREFIX}${JSON.stringify(model, null, 2)};\n`;
    await writeFile(temporary, source, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, this.path);
  }

  /** Opens and validates the model stored in this adapter's file. */
  public async open(): Promise<FileModel<Meta, Data>> {
    const source = await readFile(this.path, 'utf8');
    const trimmed = source.trim();
    if (!trimmed.startsWith(EXPORT_PREFIX)) {
      throw new Error('The data file has no supported data export.');
    }
    const serialized = trimmed.slice(EXPORT_PREFIX.length).trim().replace(/;$/, '');
    const model: unknown = JSON.parse(serialized);
    if (!model || typeof model !== 'object' || !('meta' in model) || !('data' in model) ||
        !model.meta || typeof model.meta !== 'object' || !Array.isArray(model.data)) {
      throw new Error('The data file has an invalid model.');
    }
    return model as FileModel<Meta, Data>;
  }
}

export { SimpleFileAdapter as FileAdapter };
