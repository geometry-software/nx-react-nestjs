import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const sendMail = vi.hoisted(() => vi.fn().mockResolvedValue({ messageId: 'sent' }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }));

import { SimpleFileAdapter } from '../src/adapters/file/file-adapter.js';
import { BenchmarkPdfReportAdapter } from '../src/adapters/file/benchmark-pdf-report-adapter.js';
import type { BenchmarkPdfReportModel } from '../src/adapters/file/benchmark-pdf-report.model.js';
import { GoogleProviderAdapter } from '../src/adapters/email/google-provider.adapter.js';
import { SwaggerAdapter } from '../src/adapters/swagger/swagger.adapter.js';

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
  sendMail.mockClear();
});

async function fileAdapter() {
  const directory = await mkdtemp(join(tmpdir(), 'adapter-file-'));
  temporaryDirectories.push(directory);
  return new SimpleFileAdapter<{ tag: string }, number>(join(directory, 'sample'));
}

const model = { meta: { tag: 'sample' }, data: [1, 2, 3] };

describe('SimpleFileAdapter public methods', () => {
  it('save persists the model at a fixed path', async () => {
    const adapter = await fileAdapter();
    await adapter.save(model);
    await expect(adapter.open()).resolves.toEqual(model);
  });

  it('open reports a missing file', async () => {
    const adapter = await fileAdapter();
    await expect(adapter.open()).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('supports a caller-defined suffix', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'adapter-file-'));
    temporaryDirectories.push(directory);
    const adapter = new SimpleFileAdapter(join(directory, 'sample'), '.json.ts');
    await adapter.save(model);
    await expect(adapter.open()).resolves.toEqual(model);
  });
});

const pdfModel: BenchmarkPdfReportModel = {
  serverName: 'test', startedAt: new Date(0), stoppedAt: new Date(1_000),
  generatedAt: new Date(2_000), firstObservedAt: 0, lastObservedAt: 1_000,
  intervalSeconds: 1, instances: [], adapters: [], failedQueriesByWindow: [],
  averageUpdateTimeMs: null,
};

describe('BenchmarkPdfReportAdapter public methods', () => {
  it('create renders a valid PDF buffer', async () => {
    const pdf = await new BenchmarkPdfReportAdapter().create(pdfModel);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('createMany renders multiple report pages', async () => {
    const pdf = await new BenchmarkPdfReportAdapter().createMany([pdfModel, pdfModel]);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1_000);
  });
});

describe('GoogleProviderAdapter.send', () => {
  it('sends recipient, text, and language through the configured transport', async () => {
    const adapter = new GoogleProviderAdapter({
      host: 'smtp.example.com', port: 587, secure: false,
      user: 'sender@example.com', password: 'secret', from: 'Sender',
    });
    await adapter.send({ to: 'recipient@example.com', subject: 'Hello', text: 'Body', metadata: { language: 'en' } });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'recipient@example.com', subject: 'Hello', text: 'Body',
      headers: { 'Content-Language': 'en' },
    }));
  });
});

describe('SwaggerAdapter.getDocuments', () => {
  it('uses each service port and documentation path', () => {
    const adapter = new SwaggerAdapter('http://localhost:4201', [
      { name: 'products', port: 3002, documentationPath: '/docs' },
      { name: 'login', port: 3001 },
    ]);
    expect(adapter.getDocuments()).toEqual([
      { name: 'products', url: 'http://localhost:3002/docs' },
      { name: 'login', url: 'http://localhost:3001/docs' },
    ]);
  });
});
