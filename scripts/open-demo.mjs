import { spawn, execFile } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const appUrl = 'http://localhost:4201';
let activeProcess;

function run(command, args) {
  return new Promise((resolve, reject) => {
    activeProcess = spawn(command, args, { stdio: 'inherit', shell: false });
    activeProcess.once('error', reject);
    activeProcess.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code ?? 'unknown'}`));
    });
  });
}

function openBrowser() {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'cmd'
        : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', appUrl] : [appUrl];
  execFile(command, args, () => {});
}

async function waitForApp(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      console.warn(`The dev server is still starting: ${deadline}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`The frontend did not become ready at ${url}`);
}

async function start() {
  await run(npmCommand, ['ci']);
  const devProcess = spawn(npmCommand, ['run', 'dev'], {
    stdio: 'inherit',
    shell: false,
  });
  activeProcess = devProcess;
  await waitForApp(appUrl);
  openBrowser();
  await new Promise((resolve, reject) => {
    devProcess.once('error', reject);
    devProcess.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm run dev exited with code ${code ?? 'unknown'}`));
    });
  });
}

process.on('SIGINT', () => activeProcess?.kill('SIGINT'));
process.on('SIGTERM', () => activeProcess?.kill('SIGTERM'));
start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
