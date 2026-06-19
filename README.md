# Family Tree

A privacy-first, offline-capable family tree editor that encrypts all data locally using AES-256-GCM. No backend, no database, no data leaves your browser.

## Features

- **Encrypted persistence** — All family data is encrypted with your master password before ever touching disk
- **Zero-server architecture** — Runs entirely in the browser as a static site; deployable to GitHub Pages, Netlify, or any static host
- **3-generation tree view** — Dynamic focus centered on the selected member, with smooth pan/zoom via D3.js
- **Full CRUD** — Add, edit, and delete members with relational links (father, mother, spouse)
- **Search** — Real-time search across all member attributes, instantly re-centering the tree on a match
- **Multi-tree merge** — Import and merge separate encrypted family trees; merged members are visually flagged
- **Offline-first** — Once loaded, no network requests are made; the app works fully offline
- **Multi-language** — Switch between English and Indonesian (Bahasa Indonesia) with a single click
- **Responsive** — Works on desktop and mobile browsers
- **Drag & drop** — Reposition tree nodes by dragging; positions persist in memory per session
- **Right-click menus** — Right-click a node to edit/delete; right-click the canvas to reset layout
- **Bidirectional spouse linking** — Setting a spouse on one member automatically updates the other
- **Smart parent auto-fill** — Selecting a father auto-selects his spouse as mother (and vice versa)
- **Searchable selects** — Father/mother/spouse dropdowns in the modal include filter-as-you-type
- **Sidebar** — Toggleable member list sidebar; overlays on mobile, auto-closes on selection
- **Floating action buttons** — Speed-dial FAB on mobile (reset layout, add member, save); separate edit/delete FABs appear only when a member is active

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Encryption | Web Crypto API (PBKDF2 + AES-256-GCM) |
| Visualization | D3.js v7 |
| Styling | Tailwind CSS v4 (built via PostCSS) |
| Build | Node.js + @tailwindcss/cli |
| Deployment | GitHub Actions → GitHub Pages |
| Data Format | Encrypted JSON (`.enc` files) |

## Usage

### Open the app

Serve the root directory with any static file server, or open `index.html` directly in a browser.

For local development:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

### Create a tree

1. Click **+ Add Member** to add the first person.
2. Fill in name, birth date, occupation, and other fields.
3. To link relatives, first add both members, then edit one to assign father, mother, or spouse via the dropdown menus.
4. Click a node in the tree to center the view on that member.

### Development setup

```bash
npm install
npm run build     # builds css/tailwind.css from css/source.css
```

Then serve with any static server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

### Save / Load

- **Save to browser** — encrypts the current tree with a master password and stores in `localStorage`.
- **Load from browser** — prompts for the password, then decrypts and loads from `localStorage`.
- **Export to file** — encrypts and downloads a `.enc` file.
- **Import from file** — prompts for password, opens a file picker, decrypts and loads a `.enc` file.
- **Merge** — decrypts a second `.enc` file and merges its members into the current tree; merged nodes are shown with an orange dashed border and a "MERGED" badge.

## Data Schema

```json
{
  "tree_id": "uuid",
  "tree_name": "string",
  "members": [
    {
      "id": "uuid",
      "nama": "string",
      "tanggal_lahir": "YYYY-MM-DD",
      "father_id": "uuid-or-null",
      "mother_id": "uuid-or-null",
      "spouse_id": "uuid-or-null",
      "pekerjaan": "string",
      "pendidikan": "string",
      "hobi": "string",
      "status_perkawinan": "string",
      "agama": "string",
      "catatan": "string"
    }
  ]
}
```

> All relationships use internal UUIDs. No government identifiers (NIK, KK, etc.) are stored.

## Security Model

| Stage | Mechanism |
|-------|-----------|
| Key derivation | PBKDF2-HMAC-SHA256, 100,000 iterations, random 16-byte salt |
| Encryption | AES-256-GCM with random 12-byte IV |
| Integrity | GCM authentication tag (16 bytes) verified on decryption |
| Key material | Never stored or transmitted; derived from password on each operation |
| Crypto library | Native Web Crypto API only — no third-party crypto dependencies |

The exported `.enc` file is a JSON object containing `salt`, `iv`, `ciphertext`, and `tag` (all base64-encoded).

## Deployment

Push to the `main` branch — the included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys to GitHub Pages.

The workflow:

1. Checks out the code
2. Configures GitHub Pages
3. Installs Node.js dependencies
4. Builds `css/tailwind.css` via `npm run build`
5. Uploads all static files as a deployment artifact
6. Deploys to Pages

All asset paths in the app use relative URLs (e.g., `js/app.js`), so the site resolves correctly under any GitHub Pages subdirectory path.

### Manual deployment

Any static host works — just upload the project root:

```
index.html
js/
css/
```

## Project Structure

```
├── index.html              # Main SPA (Tailwind CSS, modals, forms)
├── js/
│   ├── i18n.js             # Internationalization (EN/ID translations)
│   ├── crypto.js           # Web Crypto API: PBKDF2, AES-256-GCM
│   ├── app.js              # State management, CRUD, file I/O, merge
│   └── tree.js             # D3.js 3-generation tree visualization
├── css/
│   ├── source.css          # Tailwind CSS v4 entry point
│   └── tailwind.css        # Generated build output (gitignored)
├── package.json
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions → GitHub Pages
├── LICENSE                 # MIT License
├── REQUIREMENT.md          # Software requirement specification
└── README.md
```

## License & Credits

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).

### Third-Party Libraries

| Library | License | Usage |
|---------|---------|-------|
| [D3.js](https://d3js.org) v7 | BSD-3-Clause | Tree visualization, zoom & pan |
| [Tailwind CSS](https://tailwindcss.com) v4 | MIT | Utility-first styling (built locally) |
| [Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/) | W3C | Native browser cryptography |

D3.js is Copyright © 2010–2025 Michael Bostock. All rights reserved.

Tailwind CSS is Copyright © Tailwind Labs, Inc.
```
