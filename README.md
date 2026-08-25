<div align="center">

# 🎬 MEEM — Play Anything. Anytime.

[![Version](https://img.shields.io/badge/version-2.7.0-ffffff?style=for-the-badge&logo=electron&logoColor=black)](https://github.com/amromotaw3/MEEM)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Android-000000?style=for-the-badge)](https://github.com/amromotaw3/MEEM)
[![License](https://img.shields.io/badge/license-MIT-white?style=for-the-badge)](LICENSE)

**The next-generation personal media hub.**  
Stream torrents, watch live IPTV, listen to global radio, manage your local library, watch anime, and connect community add-ons — all in a sleek minimalist black & white interface.

</div>

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🎬 **Local Media Library** | Scan local drives, auto-fetch posters & metadata from TMDB, organize movies & series with smart grouping |
| 📺 **IPTV & Live Channels** | Built-in IPTV player with M3U/M3U8 playlist parsing, category navigation, and live TV streaming |
| 📻 **Global Live Radio** | Stream thousands of live radio stations worldwide filtered by country, genre, and station tags |
| ⚡ **Torrent Streaming** | Stream torrents in real-time without waiting for full download via WebTorrent |
| 🧩 **Stremio Add-on Support** | Install community add-ons to access unlimited content sources with one-click integration |
| 🐉 **Dedicated Anime Hub** | Dedicated anime section powered by Jikan & Kitsu APIs with episode tracking |
| 🔒 **PIN Privacy Vault** | Securely lock private media folders, movies, or collections behind a PIN-protected section |
| 📝 **Subtitle Studio & Sync** | Search, download, and sync subtitles from OpenSubtitles with a visual timeline offset editor |
| 📥 **Integrated Stream & Downloader** | Download direct video URLs or stream torrents straight to your local library |
| 👤 **Multi-Profile System** | Separate user profiles for family members with individual avatars, watch history, and preferences |
| 🔄 **Trakt.tv Progress Sync** | Real-time Trakt.tv scrobbling and playback position syncing across devices |
| 🎨 **Modern Black & White Theme** | Pitch-black minimalist design tokens with high-contrast UI and responsive layouts |
| 🖥️📱 **Cross-Platform** | Native Windows desktop app (Electron) and Android mobile app (Capacitor) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

### Installation

```bash
git clone https://github.com/amromotaw3/MEEM.git
cd MEEM
npm install
npm start
```

### Building

**Windows Installer:**
```bash
npm run build
```
Creates a production installer via `electron-builder`.

**Android APK:**
```bash
npm run mobile:build
```
Builds release APK via Capacitor from the `android/` directory.

---

## 🏗️ Project Architecture

```
MEEM/
├── main.js                    # Electron main process entry
├── package.json               # Dependencies & build config
├── capacitor.config.json      # Capacitor (Android) config
│
├── src/
│   ├── main/                  # Main process modules
│   │   ├── ipc/               # Modular IPC handlers (IPTV, Radio, Youtube, Files, etc.)
│   │   ├── ipcHandlers.js     # Centralized IPC dispatcher
│   │   ├── addons.js          # Stremio add-on engine
│   │   ├── streamer.js        # Torrent streaming & media server
│   │   ├── downloader.js      # Download manager
│   │   ├── libraryScanner.js  # Local media scanner
│   │   ├── subtitles.js       # OpenSubtitles integration
│   │   ├── updater.js         # Auto-update lifecycle
│   │   ├── store.js           # Persistent data store
│   │   ├── windowManager.js   # Window creation & management
│   │   └── mediaServer.js     # Local media streaming server
│   │
│   └── renderer/              # Frontend (UI)
│       ├── index.html         # Main application shell
│       ├── renderer.js        # Core UI renderer logic
│       ├── TMDBService.js     # TMDB API service
│       ├── css/               # Stylesheets (Minimalist Black & White theme)
│       │   ├── base.css       # Design tokens & variables
│       │   ├── layout.css     # Sidebar, grid, main layout
│       │   ├── iptv.css       # IPTV player styles
│       │   ├── radio.css      # Radio station styles
│       │   ├── components.css # Reusable UI components
│       │   └── player.css     # Video player styles
│       └── modules/           # Modular JS features (IPTV, Radio, Anime, Library, etc.)
│
├── android/                   # Capacitor Android project
├── scripts/                   # Build & release utility scripts
└── tests/                     # Test suites
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Runtime | Electron 28+ |
| Mobile Runtime | Capacitor |
| Frontend | Vanilla JavaScript (ES6+), HTML5, CSS3 |
| Movie Metadata | TMDB API |
| Anime Data | Jikan API, Kitsu API |
| Live Media | IPTV M3U, Radio Browser API |
| Content Sources | Stremio Addon Protocol |
| Torrent Engine | WebTorrent |
| Data Storage | electron-store, Supabase |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ by <strong>Amro Motawa</strong></sub>
</div>
