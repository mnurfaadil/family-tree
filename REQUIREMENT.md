# Software Requirement Specification (SRS)
## Project: Static Web-Based Encrypted Family Tree Application (Offline-First)

---

## 1. Project Overview
This project aims to build a single-page web application (SPA) that serves as an offline-first family tree viewer and editor. The application will be hosted as a static site on **GitHub Pages** and operates with **zero backend server or database**. 

To protect highly sensitive personal data (e.g., names, birthdates, relationships, and notes), data persistence is handled entirely on the client side by importing and exporting locally encrypted JSON files (`.enc`).

---

## 2. Core Architecture & Constraints
* **Deployment:** 100% Client-Side Static Web App (HTML5, CSS3, JavaScript). Must function perfectly under a GitHub Pages subdirectory (relative paths).
* **Privacy Model:** Offline-first. Zero data is transmitted over the network or stored on GitHub servers.
* **Security & Cryptography:** Native **Web Crypto API** built into modern browsers. External crypto libraries are strictly avoided for core cryptographic operations to prevent supply chain vulnerabilities.
* **Data Format:** Standard JSON (Single consolidated object) to ensure global data integrity and ease of cryptographic validation.

---

## 3. Technical Specifications

### A. Data Schema (Unencrypted Memory Representation)
```json
{
  "tree_id": "string-uuid",
  "tree_name": "string",
  "members": [
    {
      "id": "string-uuid",
      "nama": "string",
      "tanggal_lahir": "YYYY-MM-DD",
      "father_id": "string-uuid-or-null",
      "mother_id": "string-uuid-or-null",
      "spouse_id": "string-uuid-or-null",
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


> Security Rule: Never use real-world government identifiers (such as NIK or KK numbers). All familial linkages must map strictly through generated internal system UUIDs (id, father_id, mother_id, spouse_id).


### B. Cryptographic Workflow (AES-256-GCM)

1. Key Derivation: Derive a 256-bit AES key from a user-defined Master Password using PBKDF2 (HMAC-SHA256, minimum 100,000 iterations) with a cryptographically secure random salt.

2. Encryption (Save/Export): * Serialize the raw JSON object into a string.

    * Encrypt the string using AES-256-GCM.

    * Export the output as a .enc file structured with: salt (hex/base64), iv (hex/base64), ciphertext (hex/base64), and the authentication tag (hex/base64).

3. Decryption (Load/Import):

    * Read the imported file and extract cryptographic parameters (salt, iv, tag).

    * Re-derive the key using the user-inputted Master Password and the file's salt.

    * Decrypt and verify integrity via GCM authentication tag. Gracefully catch errors (e.g., "Invalid Password / Data Corrupted") without crashing the app state.

### C. Big Family Tree Visualization & Scalability

To support extensive family lineages (hundreds to thousands of members) smoothly on client-side hardware, the UI visualizer must implement:

1. Dynamic Focus / Localized Rendering: Instead of rendering the entire tree layout simultaneously, default the canvas to a 3-generation localized view (Parents, Siblings, Children) centered on a selected "Active Member". Clicking any other member smoothly transitions and re-centers the tree around them.

2. Global Local Search: A high-speed memory-based search bar allowing users to find members by name or attributes, instantly re-centering the visual focus onto that node.

3. Canvas Controls: Implement native pinch-to-zoom and pan interactions (e.g., via D3-zoom) optimized for both desktop mice and mobile touch screens.

### D. Multi-Tree Linkage (Cross-Referencing Feature)

To connect separate family lineages (e.g., when individuals from two documented families marry):

* Provide a "Merge / Link Tree" utility interface.

* Allow the user to upload two distinct .enc files sequentially.

* Prompt for passwords for each respective file.

* Decrypt both datasets into memory, merge the members arrays, and resolve cross-tree relationships if an individual's spouse_id points to an ID originating from the secondary file.

* Visually flag nodes belonging to the external merged tree (e.g., distinct border color or badge indicators) to clarify lineage boundaries.

### 4. Implementation Steps & Roadmap

* Step 1: Crypto Engine (crypto.js) — Implement Web Crypto API wrappers for PBKDF2 key derivation, AES-GCM encryption, and decryption blocks.

* Step 2: State & File I/O (app.js) — Manage browser-level file reading (FileReader API), Master Password prompts, state retention in memory, and blob generation for downloads.

* Step 3: CRUD Interface — Build interactive forms to append/modify members and assign relational attributes via dynamic dropdown menus populated from current state.

* Step 4: Graphic Engine (tree.js) — Utilize D3.js or a specialized graph library to draw nodes and edges dynamically according to current active focus rules.

* Step 5: Styling & Build — Style components with utility classes (Tailwind CSS v4, built locally via `@tailwindcss/cli`) ensuring fully responsive interfaces suited for relative asset serving on GitHub Pages.

## 5. CI/CD Deployment Automation (GitHub Actions)
To enable automated deployment, the project must include a GitHub Actions workflow:
* **Workflow Location:** `.github/workflows/deploy.yml`
* **Trigger:** Automatically execute on every `push` to the `main` branch.
* **Process:** 1. Checkout the code.
  2. Configure GitHub Pages environment permissions (`pages: write`, `id-token: write`).
  3. Setup Node.js, install dependencies, and build Tailwind CSS (`npm ci && npm run build`).
  4. Upload static assets (HTML, CSS, JS) as a deployment artifact.
  5. Deploy the artifact to GitHub Pages seamlessly without maintaining a separate `gh-pages` branch.
* **Asset Path Rule:** All structural links and asset paths (e.g., `<script src="app.js">`) must remain **relative** so the application can resolve successfully under subdirectories (`https://mnurfaadil.github.io/family-tree/`).

### Data Persistence Architecture
Data persistence is split into two distinct layers:

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Local Storage (Browser) | `localStorage` key `family-tree-data` | Daily save/load; encrypted with master password |
| File Export/Import | `.enc` file download/upload | Backup, sharing between devices; encrypted with master password |

**Session password caching:** The master password entered during a session is retained in memory (`sessionPassword`) to avoid re-prompting on subsequent saves. The cache is cleared when the page is closed or the user creates a new tree.

**Save to browser:** Encrypts the current state with the master password (using cached password if available) and stores it in `localStorage`. No file dialog or download involved.

**Load from browser:** Prompts for the master password, reads `localStorage`, decrypts, and restores state into memory.

**Export to file:** Always prompts for the master password, encrypts the current state, and triggers a `.enc` file download.

**Import from file:** Always prompts for the master password, opens a file picker, reads and decrypts the selected `.enc` file, and replaces the in-memory state.

## 6. Multi-Language Support (i18n)

The application must support dynamic language switching to accommodate users from different regions.

### Language Files
* All UI strings are centralized in a single translation module (`js/i18n.js`).
* Each language is defined as a flat key-value dictionary.
* Supported languages:
  * **en** — English (default)
  * **id** — Bahasa Indonesia

### Technical Implementation
* **Module:** `js/i18n.js` exposes `I18n.t(key, ...args)` for string lookups with positional parameter substitution (`{0}`, `{1}`, etc.).
* **Storage:** User language preference is persisted in `localStorage` under the key `family-tree-lang`.
* **Switching:** A language toggle (EN/ID) in the header calls `I18n.setLang()` followed by `UI.refreshUI()` to re-render all translatable strings without page reload.
* **Fallback:** If a key is missing in the active language, the English (`en`) value is used as fallback. If the key is missing entirely, the raw key string is displayed.
* **Scope:** The following UI layers must support translation:
  1. Header and action buttons
  2. Search sidebar (placeholder, empty state, member list labels)
  3. Member detail panel (field labels)
  4. CRUD modal forms (labels, buttons, validation messages)
  5. Confirmation dialogs and password prompts
  6. Tree visualization tooltips and legend
  7. Error and success notification messages
  8. Document `<title>` element

> Data field values (e.g., `nama`, `pekerjaan`, marital status options like `Belum Kawin`) remain in their original language as they are user-entered content, not UI labels.

## 7. Licensing & Third-Party Credits

### Project License
The project is distributed under the **MIT License**. A copy of the license must be included in the repository root as `LICENSE`.

### Third-Party Attribution
All external libraries used by this project must be properly credited in the documentation (README.md) with their respective licenses:

| Library | License | Usage |
|---------|---------|-------|
| D3.js v7 | BSD-3-Clause | Tree visualization, zoom & pan interactions |
| Tailwind CSS v4 | MIT | Utility-first CSS framework (built locally via @tailwindcss/cli) |
| Web Crypto API | W3C | Native browser cryptography (no external dependency) |

Attribution lines:
- D3.js: Copyright © 2010–2025 Michael Bostock. All rights reserved.
- Tailwind CSS: Copyright © Tailwind Labs, Inc.

> No other third-party JavaScript libraries are permitted for cryptographic operations. All encryption, key derivation, and integrity verification must use the native Web Crypto API only.