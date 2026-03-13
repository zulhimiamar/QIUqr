/**
 * Run this once with Node.js to bake your logo into app.js:
 *   node encode-logo.js
 *
 * It reads assets/logo.png, converts it to base64, and
 * automatically updates the LOGO_DATA_URL line in js/app.js
 */

const fs   = require('fs');
const path = require('path');

const logoPath  = path.join(__dirname, 'assets', 'logo.png');
const appJsPath = path.join(__dirname, 'js', 'app.js');

if (!fs.existsSync(logoPath)) {
  console.error('❌  assets/logo.png not found. Add your logo first.');
  process.exit(1);
}

const ext      = path.extname(logoPath).toLowerCase();
const mimeMap  = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const mime     = mimeMap[ext] || 'image/png';
const b64      = fs.readFileSync(logoPath).toString('base64');
const dataURL  = `data:${mime};base64,${b64}`;

let appJs = fs.readFileSync(appJsPath, 'utf8');

if (!appJs.includes('const LOGO_DATA_URL')) {
  console.error('❌  Could not find LOGO_DATA_URL in js/app.js');
  process.exit(1);
}

appJs = appJs.replace(
  /const LOGO_DATA_URL = '[^']*';/,
  `const LOGO_DATA_URL = '${dataURL}';`
);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log(`✅  Done! Logo encoded (${mime}, ${Math.round(b64.length / 1024)}KB) and saved into js/app.js`);
console.log('    Commit and push js/app.js to GitHub.');