// ─── Config ──────────────────────────────────────────────────
const LOGO_PATH = 'assets/logo.png';
const PREVIEW_SIZE = 280;

// ─── State ───────────────────────────────────────────────────
let lastCanvas = null;

// ─── UI Bindings ─────────────────────────────────────────────
document.getElementById('qr-size').addEventListener('input', e => {
  document.getElementById('size-label').textContent = e.target.value + 'px';
});
document.getElementById('logo-size').addEventListener('input', e => {
  document.getElementById('logo-size-label').textContent = e.target.value + '%';
});
document.getElementById('content').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey) generate();
});

// ─── ECC Map ─────────────────────────────────────────────────
const eccMap = {
  H: QRCode.CorrectLevel.H,
  Q: QRCode.CorrectLevel.Q,
  M: QRCode.CorrectLevel.M,
  L: QRCode.CorrectLevel.L
};

// ─── Generate ────────────────────────────────────────────────
function generate() {
  const content = document.getElementById('content').value.trim();
  if (!content) { setStatus('err', '⚠ Please enter some content'); return; }

  setStatus('', 'Generating…');

  const size  = parseInt(document.getElementById('qr-size').value);
  const dark  = document.getElementById('color-dark').value;
  const light = document.getElementById('color-light').value;
  const ecc   = document.getElementById('ecc').value;

  const container = document.getElementById('qr-render');
  container.innerHTML = '';

  try {
    new QRCode(container, {
      text:         content,
      width:        size,
      height:       size,
      colorDark:    dark,
      colorLight:   light,
      correctLevel: eccMap[ecc]
    });

    setTimeout(() => {
      const sourceCanvas = container.querySelector('canvas');
      if (!sourceCanvas) {
        setStatus('err', '✕ Failed — try shorter content or lower ECC');
        return;
      }

      stampLogo(sourceCanvas, size, () => {
        lastCanvas = sourceCanvas;
        drawPreview(sourceCanvas);
        showOutput();
        setStatus('ok', '✓ Ready — scan to test!');
      });
    }, 100);

  } catch (err) {
    setStatus('err', '✕ Error: ' + err.message);
  }
}

// ─── Draw scaled preview (always fixed 280×280) ───────────────
function drawPreview(sourceCanvas) {
  const preview = document.getElementById('qr-preview');
  preview.width  = PREVIEW_SIZE;
  preview.height = PREVIEW_SIZE;
  const ctx = preview.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sourceCanvas, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
}

// ─── Stamp logo onto full-res canvas ─────────────────────────
function stampLogo(canvas, size, done) {
  const logoPercent = parseInt(document.getElementById('logo-size').value) / 100;
  const rounded     = document.getElementById('rounded').checked;
  const ctx         = canvas.getContext('2d');

  const img = new Image();

  img.onload = () => {
    const maxDim = Math.round(size * logoPercent);
    const aspect = img.naturalWidth / img.naturalHeight;
    let logoW, logoH;

    if (aspect >= 1) {
      logoW = maxDim;
      logoH = Math.round(maxDim / aspect);
    } else {
      logoH = maxDim;
      logoW = Math.round(maxDim * aspect);
    }

    const x   = Math.round((size - logoW) / 2);
    const y   = Math.round((size - logoH) / 2);
    const pad = Math.round(Math.min(logoW, logoH) * 0.15);

    ctx.save();
    ctx.fillStyle = '#ffffff';

    if (rounded) {
      const r = Math.max(logoW, logoH) / 2 + pad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      roundRect(ctx, x - pad, y - pad, logoW + pad * 2, logoH + pad * 2, 8);
      ctx.fill();
    }

    ctx.drawImage(img, x, y, logoW, logoH);
    ctx.restore();
    done();
  };

  img.onerror = () => {
    // Logo failed (e.g. file:// protocol) — generate QR without logo
    console.warn('Logo could not load — QR generated without logo. Use Live Server locally.');
    done();
  };

  img.src = LOGO_PATH;
}

// ─── Helpers ─────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function showOutput() {
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('qr-preview').style.display  = 'block';
  document.getElementById('dl-row').classList.remove('output-hidden');
}

function setStatus(type, msg) {
  const el = document.getElementById('status');
  el.className = 'status' + (type ? ' ' + type : '');
  el.textContent = msg;
}

// ─── Downloads ───────────────────────────────────────────────
function downloadPNG() {
  if (!lastCanvas) return;
  const a = document.createElement('a');
  a.download = 'qr-code.png';
  a.href = lastCanvas.toDataURL('image/png');
  a.click();
}

function downloadSVG() {
  if (!lastCanvas) return;
  const size    = lastCanvas.width;
  const dataURL = lastCanvas.toDataURL('image/png');
  const svg     = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><image width="${size}" height="${size}" xlink:href="${dataURL}"/></svg>`;
  const blob    = new Blob([svg], { type: 'image/svg+xml' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.download    = 'qr-code.svg';
  a.href        = url;
  a.click();
  URL.revokeObjectURL(url);
}