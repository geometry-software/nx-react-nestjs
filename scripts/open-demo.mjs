import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontendUrl = 'http://localhost:4201';
const endpoints = [
  frontendUrl,
  `http://localhost:${process.env.LOGIN_PORT || 3001}/docs`,
  `http://localhost:${process.env.PRODUCTS_PORT || 3002}/docs`,
  `http://localhost:${process.env.SHIPPING_PORT || 3004}/docs`,
  `http://localhost:${process.env.INVOICES_PORT || 3005}/docs`,
];
let childProcess;

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`npm ${args.join(' ')} exited with code ${code}`)),
    );
  });
}

async function waitFor(url, timeout = 120000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (childProcess?.exitCode !== null) {
      throw new Error('The development services stopped during startup');
    }

    try {
      if ((await fetch(url, { cache: 'no-store' })).ok) return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Service did not become ready: ${url}`);
}

function openBrowser() {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args =
    process.platform === 'win32'
      ? ['/c', 'start', '', frontendUrl]
      : [frontendUrl];
  execFile(command, args);
}

async function start() {
  const dependenciesInstalled =
    existsSync('node_modules') &&
    existsSync('node_modules/nx') &&
    existsSync('node_modules/.bin/nx');

  if (!dependenciesInstalled) await run(['ci']);

  childProcess = spawn(npm, ['run', 'dev'], { stdio: 'inherit' });
  await Promise.all(endpoints.map((url) => waitFor(url)));
  openBrowser();
}

process.once('SIGINT', () => childProcess?.kill('SIGINT'));
process.once('SIGTERM', () => childProcess?.kill('SIGTERM'));

start().catch((error) => {
  console.error(error.message);
  childProcess?.kill('SIGTERM');
  process.exitCode = 1;
});
