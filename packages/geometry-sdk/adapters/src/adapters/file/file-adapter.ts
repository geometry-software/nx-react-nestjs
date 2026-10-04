import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileModel } from './file-model.js';

const FILE_SUFFIX = '.data.ts';
const EXPORT_PREFIX = 'export const fileData = ';

export class FileAdapter<Meta extends object, Data> {
  constructor(private readonly directory: string) {}

  async create(name: string, model: FileModel<Meta, Data>): Promise<void> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
      throw new Error('Data file names may contain only letters, digits, hyphens, and underscores.');
    }
    await mkdir(this.directory, { recursive: true });
    const target = join(this.directory, `${name}${FILE_SUFFIX}`);
    const temporary = join(this.directory, `${name}.${randomUUID()}.tmp`);
    const source = `${EXPORT_PREFIX}${JSON.stringify(model, null, 2)};\n`;
    await writeFile(temporary, source, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, target);
  }

  async findAll(): Promise<FileModel<Meta, Data>[]> {
    let names: string[];
    try {
      names = await readdir(this.directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    return Promise.all(names.filter((name) => name.endsWith(FILE_SUFFIX)).map(async (name) => {
      const source = await readFile(join(this.directory, name), 'utf8');
      return this.parse(source);
    }));
  }

  async read(name: string): Promise<Buffer> {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
      throw new Error('Data file names may contain only letters, digits, hyphens, and underscores.');
    }
    return readFile(join(this.directory, `${name}${FILE_SUFFIX}`));
  }

  async findOne(name: string): Promise<FileModel<Meta, Data>> {
    return this.parse((await this.read(name)).toString('utf8'));
  }

  parse(source: string): FileModel<Meta, Data> {
    const trimmed = source.trim();
    if (!trimmed.startsWith(EXPORT_PREFIX)) {
      throw new Error('The data file has no supported data export.');
    }
    const serialized = trimmed
      .slice(EXPORT_PREFIX.length)
      .trim()
      .replace(/;$/, '');
    const model: unknown = JSON.parse(serialized);
    if (!model || typeof model !== 'object' || !('meta' in model) || !('data' in model) ||
        !model.meta || typeof model.meta !== 'object' || !Array.isArray(model.data)) {
      throw new Error('The data file has an invalid model.');
    }
    return model as FileModel<Meta, Data>;
  }
}
