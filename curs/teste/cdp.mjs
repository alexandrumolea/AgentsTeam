// Mic driver CDP fără dependențe (Node 22+: WebSocket global). Pornește un Chrome separat, cu profil temporar.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export async function launch({ headless = true, port = 9333 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cdp-'));
  const args = [`--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,800'];
  if (headless) args.push('--headless=new');
  const proc = spawn(CHROME, [...args, 'about:blank'], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 50; i++) { try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map(); const listeners = [];
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } else listeners.forEach(l => l(m)); });
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const pages = [];
  listeners.push(async m => { if (m.method === 'Target.targetCreated' && m.params.targetInfo.type === 'page' && m.params.targetInfo.openerId) { const { sessionId } = await send('Target.attachToTarget', { targetId: m.params.targetInfo.targetId, flatten: true }); await instrument(sessionId).catch(() => {}); pages.push({ targetId: m.params.targetInfo.targetId, sessionId, popup: true }); } });
  await send('Target.setDiscoverTargets', { discover: true });
  const exceptii = [], cereri = [];
  listeners.push(m => { if (m.method === 'Runtime.exceptionThrown') exceptii.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Network.requestWillBeSent') cereri.push(m.params.request.url); });
  async function instrument(sessionId) { await send('Runtime.enable', {}, sessionId); await send('Network.enable', {}, sessionId); await send('Page.enable', {}, sessionId); }
  async function open(url) { const { targetId } = await send('Target.createTarget', { url: 'about:blank' }); const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }); await instrument(sessionId); await send('Page.navigate', { url }, sessionId); await new Promise(r => setTimeout(r, 800)); const p = { targetId, sessionId }; pages.push(p); return p; }
  const evaluate = async (p, expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, userGesture: false }, p.sessionId); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  async function click(p, selector) { const b = await evaluate(p, `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: b.x, y: b.y, button: 'left', clickCount: 1 }, p.sessionId); await new Promise(r => setTimeout(r, 500)); }
  const KEYS = { ArrowRight: 39, ArrowLeft: 37, ArrowDown: 40, ArrowUp: 38, PageDown: 34, PageUp: 33, ' ': 32, Enter: 13, Escape: 27, F5: 116, '.': 190, b: 66, c: 67, n: 78, s: 83, f: 70 };
  async function key(p, k) { const code = KEYS[k]; const text = k.length === 1 ? k : undefined; await send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', key: k, windowsVirtualKeyCode: code, text }, p.sessionId); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, windowsVirtualKeyCode: code }, p.sessionId); await new Promise(r => setTimeout(r, 120)); }
  async function screenshot(p, file) { const { data } = await send('Page.captureScreenshot', { format: 'png' }, p.sessionId); (await import('node:fs')).writeFileSync(file, Buffer.from(data, 'base64')); }
  const close = () => { try { ws.close(); } catch {} proc.kill(); };
  return { exceptii, cereri, send, open, evaluate, click, key, pages, close, screenshot, listeners };
}
