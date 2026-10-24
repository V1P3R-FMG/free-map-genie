# Optional Vivaldi compatibility build

Vivaldi can fail to inject `all_frames` content scripts into iframes hosted by an offscreen document. The backend then never provides its services. This build-time workaround uses a regular extension tab instead; it does not fix Vivaldi itself.

```sh
FMG_VIVALDI_COMPAT=1 yarn build
```

Load `.output/chrome-mv3` as an unpacked extension. Keep the pinned **FMG — Vivaldi backend** tab open. It is created inactive and marked non-auto-discardable. The build requires `tabs` instead of `offscreen` permission. Regular Chrome and Firefox builds retain their existing backend paths.

Backend ports from this exact extension tab are routed globally, like offscreen ports, rather than being scoped to the technical tab. Existing tabs are reused on initialization; discarded ones are reloaded. Closing the backend tab recreates it. Closing its window recovers it in another existing normal window, but does not open a new window when the browser exits.

Export important data before switching builds. No database schema migration is introduced. Access to existing data from differently installed extension IDs has not been verified.

## Validation

Automated checks in isolated Vivaldi 8.2.4133.94 stable profiles on Linux confirmed backend RPC, guest profile creation, IndexedDB write/read, persistence across popup reload, cross-tab RPC, storage iframe RPC, and recovery after closing the technical tab or its window.

A user also tested the combined local build (including the separate hashed-map-script fix): login, map loading, marking a location, preserving that mark after refreshing, and browser restart all worked. This is manual user verification, not an automated logged-in E2E test. The optional build should be tested together with the hashed-map-script fix on current MapGenie pages.

Focused lifecycle regression (uses the project's installed esbuild dependency):

```sh
node test-backend-lifecycle.mjs
```

This executes the actual TypeScript initialization code with mocked browser APIs and checks multi-window recovery, discarded-tab recovery, and not reopening a window during browser exit. It does not simulate a service-worker restart. Full restart deduplication and all supported games are not covered by this regression.

Related report: https://github.com/V1P3R-FMG/free-map-genie/issues/90
