// Page-turn viewer for issue PDFs. It reads the PDF named in data-pdf and draws each page with PDF.js.
import * as pdfjsLib from './assets/pdfjs/pdf.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./assets/pdfjs/pdf.worker.min.js', import.meta.url).href;

const root = document.getElementById('viewer');
const pdfUrl = root.dataset.pdf;
const stage = root.querySelector('.fb-stage');
const book = root.querySelector('.fb-book');
const leftSlot = root.querySelector('.fb-left');
const rightSlot = root.querySelector('.fb-right');
const statusEl = root.querySelector('.fb-status');
const pageInput = root.querySelector('.fb-page');
const totalEl = root.querySelector('.fb-total');
const btn = name => root.querySelectorAll('[data-go="' + name + '"]');

let pdf, n = 0, ratio = 195 / 275, spreads = [], mode = 'spread', pos = 0, busy = false;
const urls = {};
const START = initialPage();

function makeSpreads(count) {
  const s = [[null, 1]];
  for (let p = 2; p <= count; p += 2) s.push([p, p + 1 <= count ? p + 1 : null]);
  return s;
}
function pagesAt(i) { return mode === 'spread' ? spreads[i] : [null, i + 1]; }
function lastPos() { return mode === 'spread' ? spreads.length - 1 : n - 1; }
function firstPage(i) { const [l, r] = pagesAt(i); return l || r; }
function posOfPage(p) {
  p = Math.min(Math.max(1, p), n);
  return mode === 'spread' ? spreads.findIndex(([l, r]) => l === p || r === p) : p - 1;
}

function face(p, extra) {
  const f = document.createElement('div');
  f.className = 'fb-face' + (extra ? ' ' + extra : '');
  if (!p) { f.classList.add('blank'); return f; }
  const img = document.createElement('img');
  img.alt = 'Page ' + p; img.dataset.p = p; img.draggable = false;
  if (urls[p]) img.src = urls[p]; else f.classList.add('loading');
  f.appendChild(img);
  return f;
}
function fill(slot, p) { slot.replaceChildren(face(p)); slot.dataset.p = p || ''; }

function shiftFor(l, r) {
  if (mode !== 'spread') return 'none';
  return l == null ? 'translateX(-25%)' : r == null ? 'translateX(25%)' : 'none';
}

function show() {
  const [l, r] = pagesAt(pos);
  fill(leftSlot, l); fill(rightSlot, r);
  book.style.transform = shiftFor(l, r);
  updateBar();
}

function updateBar() {
  const [l, r] = pagesAt(pos);
  pageInput.value = l && r ? l + '-' + r : String(l || r);
  totalEl.textContent = '/ ' + n;
  const atStart = pos === 0, atEnd = pos === lastPos();
  btn('first').forEach(b => (b.disabled = atStart));
  btn('prev').forEach(b => (b.disabled = atStart));
  btn('next').forEach(b => (b.disabled = atEnd));
  btn('last').forEach(b => (b.disabled = atEnd));
  history.replaceState(null, '', '#page=' + firstPage(pos));
}

function turn(dir) {
  const to = pos + dir;
  if (busy || to < 0 || to > lastPos()) return;
  if (mode === 'single') return slide(dir, to);
  busy = true;
  const [l0, r0] = spreads[pos], [l1, r1] = spreads[to];
  const leaf = document.createElement('div');
  leaf.className = 'fb-leaf ' + (dir > 0 ? 'fb-next' : 'fb-prev');
  if (dir > 0) { leaf.append(face(r0, 'fb-front'), face(l1, 'fb-rear')); fill(rightSlot, r1); }
  else { leaf.append(face(l0, 'fb-front'), face(r1, 'fb-rear')); fill(leftSlot, l1); }
  book.appendChild(leaf);
  leaf.getBoundingClientRect();
  book.style.transform = shiftFor(l1, r1);
  let finished = false;
  const done = () => { if (finished) return; finished = true; pos = to; show(); leaf.remove(); busy = false; };
  requestAnimationFrame(() => leaf.classList.add('turn'));
  leaf.addEventListener('transitionend', e => { if (e.target === leaf) done(); });
  setTimeout(done, 1100);
}

function slide(dir, to) {
  busy = true;
  const out = rightSlot.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-dir * 40) + 'px)' }], { duration: 160, easing: 'ease-in' });
  out.onfinish = () => {
    pos = to; show();
    const inn = rightSlot.animate([{ opacity: 0, transform: 'translateX(' + (dir * 40) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out' });
    inn.onfinish = () => { busy = false; };
  };
}

function goTo(p) {
  const to = posOfPage(p);
  if (to === pos || busy) return updateBar();
  if (Math.abs(to - pos) === 1) return turn(to - pos);
  pos = to; show();
}

function layout() {
  const w = stage.clientWidth - 100, h = stage.clientHeight - 40;
  const newMode = w < 620 || w / h < ratio * 1.45 ? 'single' : 'spread';
  if (newMode !== mode && n) { const p = firstPage(pos); mode = newMode; pos = posOfPage(p); }
  mode = newMode;
  const pw = mode === 'spread' ? Math.min(w / 2, h * ratio) : Math.min(w + 60, h * ratio);
  book.style.setProperty('--pw', pw + 'px');
  book.style.width = (mode === 'spread' ? pw * 2 : pw) + 'px';
  book.style.height = pw / ratio + 'px';
  book.classList.toggle('single', mode === 'single');
  if (n) show();
}

async function renderAll() {
  const order = [1, 2, 3];
  for (let p = 4; p <= n; p++) order.push(p);
  const start = posOfPage(START);
  for (const p of pagesAt(start).filter(Boolean).reverse()) { order.splice(order.indexOf(p), 1); order.unshift(p); }
  const targetH = Math.min(2600, Math.max(1400, Math.round(window.innerHeight * (window.devicePixelRatio || 1) * 1.2)));
  let made = 0;
  for (const p of order) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: targetH / page.getViewport({ scale: 1 }).height });
    const c = document.createElement('canvas');
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.92));
    urls[p] = URL.createObjectURL(blob);
    root.querySelectorAll('img[data-p="' + p + '"]').forEach(img => { img.src = urls[p]; img.parentElement.classList.remove('loading'); });
    made++;
    statusEl.textContent = made < n ? 'Loading pages ' + made + ' of ' + n : '';
  }
}

function initialPage() {
  const m = location.hash.match(/page=(\d+)/);
  return m ? parseInt(m[1], 10) : 1;
}

function bind() {
  root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const g = b.dataset.go;
    if (g === 'prev') turn(-1); else if (g === 'next') turn(1);
    else if (g === 'first') goTo(1); else if (g === 'last') goTo(n);
    else if (g === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else root.requestFullscreen(); }
  }));
  const fs = root.querySelector('[data-go="full"]');
  if (!document.fullscreenEnabled) fs.hidden = true;
  leftSlot.addEventListener('click', () => turn(-1));
  rightSlot.addEventListener('click', e => {
    if (mode === 'single') { const r = rightSlot.getBoundingClientRect(); turn(e.clientX < r.left + r.width / 3 ? -1 : 1); }
    else turn(1);
  });
  pageInput.addEventListener('change', () => { const p = parseInt(pageInput.value, 10); if (p) goTo(p); else updateBar(); pageInput.blur(); });
  pageInput.addEventListener('focus', () => pageInput.select());
  document.addEventListener('keydown', e => {
    if (e.target === pageInput) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); turn(1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); turn(-1); }
    else if (e.key === 'Home') goTo(1); else if (e.key === 'End') goTo(n);
  });
  let sx = null, sy = null;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { turn(dx < 0 ? 1 : -1); }
  });
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(layout, 120); });
}

async function start() {
  bind();
  layout();
  statusEl.textContent = 'Loading the issue';
  try {
    pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
    n = pdf.numPages;
    const vp = (await pdf.getPage(1)).getViewport({ scale: 1 });
    ratio = vp.width / vp.height;
    spreads = makeSpreads(n);
    pos = posOfPage(START);
    layout();
    await renderAll();
  } catch (err) {
    console.error(err);
    statusEl.innerHTML = 'The viewer could not open this issue. <a href="' + pdfUrl + '">Download the PDF</a> instead.';
  }
}
start();
