<p align="center">
    <img src="./assets/logo.png" />
    <h1 align="center">FMG: Free <a href="https://mapgenie.io">Mapgenie</a> PRO!</h1>
</p>

<p align="center">
    <strong>🚧 FMG V3 - Work in Progress 🚧</strong>
</p>

## About

FMG (Free Map Genie) is a browser extension that enhances the [Mapgenie.io](https://mapgenie.io) experience by unlocking PRO features for free. Version 3 is a complete rewrite from scratch.

> [!WARNING]
> FMG V3 is actively under development and uses a new data saving approach. Do not clone and use this branch without a backup as there is a possibility of data corruption or loss.

## ✨ Pro Features unlock state

| Feature               | Unlocked |
| --------------------- | -------- |
| **locations**         | ✔️       |
| **track categories**  | ✔️       |
| **presets**           | ✔️       |
| **notes**             | ✔️       |
| **tarkov quest tool** | ✔️       |
| **pro maps**          | ✔️       |
| **heatmaps**          | ✔️       |
| **guides**            | ✔️       |

## 🚀 What's New in V3 for developers

### Build System & Development

- **Modern Build System**: Migrated from [Webpack](https://webpack.js.org/) to [WXT](https://wxt.dev/)
  - WXT is specifically designed for web extensions, making development and building much cleaner
- **End-to-End Testing**: Integrated [Playwright](https://playwright.dev/) for comprehensive E2E testing

### Architecture Improvements

- **Enhanced Request Interceptor**: New [request interceptor](./src/common/axios/interceptor.ts) using [Axios Interceptors](https://axios-http.com/docs/interceptors)
- **Modern Messaging System**: Complete rewrite of the [messaging system](./src/common/messaging/) with type safety and memoization
  - Organized into [services](./src/services) for better grouping of functionality
  - Each service has a `use` and `provide` method.
  - Services behave like normal JavaScript objects, with automatic conversion to invoke requests

### Backend Simulation

- **Simulated Backend**: FMG now includes a backend simulation for cleaner page scripts
  - Page scripts only forward API requests to the backend
  - Page scripts are no longer responsible for data saving

### Database & Storage

- **Modern Database**: Switched to [Dexie](https://dexie.org/) using IndexedDB under the hood
  - More similar to traditional backend databases
  - Comes with a challenge we need to migrate legacy localStorage data to our new dexie database
- **Client**: New [Client class](./src/common/client.ts) automatically intercepts and forwards requests
  - Handles locations, categories, presets, and notes automatically
  - Cleaner map and guide scripts

## 📁 Project Structure

```
├── src/
│   ├── common/          # Shared utilities and modules
│   │   ├── axios/       # Axios related utils and interceptor
│   │   └── messaging/   # Type-safe messaging system
│   ├── contexts/        # Extension contexts (background, content, popup)
│   ├── services/        # Services using the message system
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper utilities
│   └── assets/          # Static assets
├── modules/             # Wxt modules
├── icons/               # icons for fmg-icon font
├── e2e/                 # End-to-end tests
└── public/              # Public assets
```

---

<p align="center">
    Made with ❤️ by <a href="https://github.com/V1P3R-FMG">V1P3R</a>
</p>
