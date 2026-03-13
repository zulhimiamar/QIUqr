// ─── Config ────────────────────────────────────────────────
// Path to your logo inside the project. Just replace the file
// in assets/ and keep the same filename, or update this path.
const LOGO_PATH = 'assets/logo.png';

// ─── State ─────────────────────────────────────────────────
let lastCanvas = null;

// ─── UI Bindings ────────────────────────────────────────────
document.getElementById('qr-size').addEventListener('input', e => {
  document.getElementById('size-label').textContent = e.target.value + 'px';
});

document.getElementById('logo-size').addEventListener('input', e => {
  document.getElementById('logo-size-label').textContent = e.target.value + '%';
});

// Ctrl+Enter shortcut
document.getElementById('content').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey) generate();
});

// ─── ECC Map ────────────────────────────────────────────────
const eccMap = {
  H: QRCode.CorrectLevel.H,
  Q: QRCode.CorrectLevel.Q,
  M: QRCode.CorrectLevel.M,
  L: QRCode.CorrectLevel.L
};

// ─── Generate ───────────────────────────────────────────────
function generate() {
  const content = document.getElementById('content').value.trim();
  const status  = document.getElementById('status');

  if (!content) {
    setStatus('err', '⚠ Please enter some content');
    return;
  }

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

    // QRCode.js renders async
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        setStatus('err', '✕ Failed — try shorter content or lower ECC');
        return;
      }

      stampLogo(canvas, size, () => {
        showOutput(canvas);
        setStatus('ok', '✓ Ready — scan to test!');
      });
    }, 100);

  } catch (err) {
    setStatus('err', '✕ Error: ' + err.message);
  }
}

// ─── Stamp logo onto canvas ──────────────────────────────────
function stampLogo(canvas, size, done) {
  const logoPercent = parseInt(document.getElementById('logo-size').value) / 100;
  const rounded     = document.getElementById('rounded').checked;
  const ctx         = canvas.getContext('2d');
  const pad         = Math.round(size * logoPercent * 0.12);

  const img = new Image();

  img.onload = () => {
    // Preserve aspect ratio — fit logo within a square bounding box
    const maxDim  = Math.round(size * logoPercent);
    const aspect  = img.naturalWidth / img.naturalHeight;
    let logoW, logoH;

    if (aspect >= 1) {
      // Wider than tall (or square)
      logoW = maxDim;
      logoH = Math.round(maxDim / aspect);
    } else {
      // Taller than wide
      logoH = maxDim;
      logoW = Math.round(maxDim * aspect);
    }

    // Center on canvas
    const x = Math.round((size - logoW) / 2);
    const y = Math.round((size - logoH) / 2);

    ctx.save();

    // White backing — sized to the actual logo dimensions
    ctx.fillStyle = '#ffffff';
    if (rounded) {
      // Circle that encloses the logo
      const r  = Math.max(logoW, logoH) / 2 + pad;
      const cx = size / 2;
      const cy = size / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
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
    // If logo fails to load (e.g. file not added yet), just finish without it
    console.warn('Logo not found at: ' + LOGO_PATH + '. Add your PNG to the assets/ folder.');
    done();
  };

  img.src = LOGO_PATH;
}

// ─── Helpers ────────────────────────────────────────────────
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

function showOutput(canvas) {
  lastCanvas = canvas;
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('qr-container').style.display = 'block';
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