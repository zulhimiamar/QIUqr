# QR Studio

A free, self-hosted QR code generator with a fixed logo in the center.
No backend. No database. Runs entirely in the browser.

## Project Structure

```
qr-studio/
├── index.html          ← Main page
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── app.js          ← QR logic & logo stamping
│   └── qrcode.min.js   ← QRCode.js library (see setup)
├── assets/
│   └── logo.png        ← YOUR LOGO (add this file)
└── README.md
```

## Setup

### 1. Add your logo
Drop your logo file into the `assets/` folder and name it `logo.png`.

### 2. Download QRCode.js library
```bash
curl -o js/qrcode.min.js https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
```

### 3. Open locally
Just open `index.html` in your browser — no server needed for local testing.

> **Note:** Due to browser security (CORS), the logo will only appear when served
> over HTTP/HTTPS. Use VS Code's **Live Server** extension for local testing.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site is live at `https://yourusername.github.io/repo-name`

## Customization

| What | Where |
|------|-------|
| Logo file | `assets/logo.png` |
| Logo path (if renamed) | `LOGO_PATH` constant in `js/app.js` |
| Colors, fonts, layout | `css/style.css` |
| Page title | `<title>` in `index.html` |

## Tips

- Use **High (H)** error correction when using a logo — it tolerates up to 30% data loss
- Keep logo size under 30% for reliable scanning
- Square logos with a transparent background look best
- Recommended logo resolution: 200×200px minimum