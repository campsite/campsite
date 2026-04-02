# Implementation Plan: Electron Wrapper (Replace Todesktop)

## Overview

Replace `@todesktop/client-core` with a self-managed Electron wrapper using a 3-layer architecture: Electron main process → preload script → bridge adapter. Implementation proceeds bottom-up: scaffold the Electron app, build the IPC layer, create the bridge adapter, migrate all imports, update configs, and wire packaging/auto-updates.

## Tasks

- [x] 1. Scaffold `apps/desktop` Electron package
  - [x] 1.1 Create `apps/desktop/package.json` with Electron, electron-builder, electron-updater, and @electron/notarize dependencies
    - Add scripts for `dev`, `build`, and `package`
    - Register the package in the pnpm workspace
    - _Requirements: 16.1, 16.4_

  - [x] 1.2 Create `apps/desktop/tsconfig.json` and `apps/desktop/electron-builder.yml`
    - tsconfig targets ES2022 with module commonjs for Electron main process
    - electron-builder.yml configures macOS `.dmg`, Windows `.exe`/`.nsis`, GitHub provider for auto-updates, and notarization via `@electron/notarize`
    - _Requirements: 16.1, 16.2, 16.4_

  - [x] 1.3 Create TypeScript declarations for `window.electronAPI` at `apps/web/types/electron.d.ts`
    - Declare the `ElectronBridgeAPI` interface on `Window`
    - Include all methods, event listeners, and `platform` property
    - _Requirements: 2.1, 2.3_

- [x] 2. Implement Electron main process
  - [x] 2.1 Create `apps/desktop/src/main.ts` with app lifecycle, single instance lock, and main window creation
    - Register `campsite://` (prod) or `campsite-dev://` (dev) protocol before app ready
    - Request single instance lock; quit second instance and forward protocol URLs
    - On `app.whenReady()`, create BrowserWindow with `titleBarStyle: 'hiddenInset'` (macOS) / `frame: false` (Windows/Linux), `contextIsolation: true`, `nodeIntegration: false`, preload script attached
    - Load `WEB_URL` with minimum size 800×600
    - Handle `activate` event for macOS dock re-open
    - Handle `window-all-closed` to quit on non-macOS
    - Queue protocol URLs arriving before window is ready; deliver after `did-finish-load`
    - _Requirements: 2.1, 2.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.6, 14.1, 14.2, 14.3_

  - [x] 2.2 Implement IPC handler registration in main process
    - Window management handlers: `window:maximize`, `window:minimize`, `window:restore`, `window:close`, `window:blur`, `window:show`, `window:create`, `window:get-all`
    - Maintain `WindowRegistry` (Map<string, BrowserWindow>) for created windows; clean up on close
    - Badge handlers: `app:set-badge-count`, `app:dock-set-badge` (macOS-only dock badge)
    - Screen capture: `app:get-capture-sources` using `desktopCapturer.getSources`, return base64 thumbnails
    - Navigation: `webcontents:go-back`, `webcontents:go-forward`, `webcontents:can-go-back`, `webcontents:can-go-forward`, `webcontents:load-url`
    - System: `system:get-media-access-status`, `system:ask-for-media-access`, `system:open-external`
    - App menu: `app-menu:add`, `app-menu:refresh` with menu rebuild logic
    - App quit: `app:quit`
    - _Requirements: 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.1, 6.2, 7.1, 7.2, 7.3, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2_

  - [x] 2.3 Implement protocol URL routing in main process
    - Parse incoming protocol URLs in `handleProtocolURL()`
    - Route `/calls/join/` URLs to a new call window
    - Route `://auth/desktop` URLs to the main window renderer via IPC
    - Forward all other URLs to the main window renderer
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 2.4 Implement auto-updater setup in main process
    - Configure `electron-updater` with GitHub Releases provider
    - Check for updates on launch and every 4 hours
    - Download silently in background; install on next quit via `autoUpdater.quitAndInstall()`
    - Catch and log all errors without crashing or showing UI
    - Disable in development mode
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 2.5 Write property test for protocol URL routing
    - **Property 3: Protocol URL routing**
    - Verify `/calls/join/` URLs create call windows, `://auth/desktop` URLs forward to main window, other URLs forward to main window renderer
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [x] 3. Implement preload script
  - [x] 3.1 Create `apps/desktop/src/preload.ts` exposing `electronAPI` via `contextBridge`
    - Wrap all `ipcRenderer.invoke` calls in typed functions (window, app, navigation, system, app menu)
    - Expose event listeners for `protocol-url`, `did-navigate-in-page`, `app:activate` with unsubscribe functions
    - Expose `platform` property from `process.platform`
    - _Requirements: 2.1, 2.3_

- [x] 4. Checkpoint — Verify Electron app scaffolding
  - Ensure all files compile, ask the user if questions arise.

- [x] 5. Implement bridge adapter and detection logic
  - [x] 5.1 Create `apps/web/utils/electron-bridge.ts` with full API surface
    - Implement `getAPI()` helper that returns `window.electronAPI` or `null`
    - Export `app` object: `dock.setBadge`, `setBadgeCount`, `getCaptureSources`, `on` (openProtocolURL), `once` (registerProtocolUrlListeners — call callback immediately)
    - Export `nativeWindow` object: `maximize`, `minimize`, `restore`, `blur`, `show`, `create`, `getWebContents`, `getAllWindows`
    - Export `webContents` object: `on` (did-navigate-in-page), `canGoBack`, `canGoForward`, `goBack`, `goForward`, `loadURL`
    - Export `systemPreferences` object: `getMediaAccessStatus`, `askForMediaAccess`
    - Export `appMenu` object: `add`, `refresh`
    - Export `os` object: `openURL`
    - Export `newApp` object: `on` (activate with unsubscribe)
    - Re-export `CaptureSource` type
    - All functions gracefully no-op when `window.electronAPI` is undefined
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2_

  - [x] 5.2 Update `packages/ui/src/hooks/useIsDesktopApp.ts` to detect `window.electronAPI`
    - `isDesktopApp()` returns `true` if `window.electronAPI` OR `window.todesktop` is defined
    - Returns `false` in SSR and standard browser contexts
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.3 Update `apps/web/utils/queryClient.ts` detection logic
    - Update `isDesktopRuntime()` to also check for `window.electronAPI`
    - _Requirements: 1.1, 1.4_

  - [ ]* 5.4 Write property test for desktop detection correctness
    - **Property 1: Desktop detection correctness**
    - Verify `isDesktopApp()` returns `true` iff `window.electronAPI` or `window.todesktop` is defined, `false` otherwise including SSR
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [ ]* 5.5 Write property test for graceful degradation
    - **Property 7: Graceful degradation**
    - Verify all bridge adapter functions resolve without throwing when `window.electronAPI` is undefined, returning sensible defaults
    - **Validates: Requirements 13.1, 13.2**

  - [ ]* 5.6 Write property test for badge delegation correctness
    - **Property 4: Badge delegation correctness**
    - Verify `app.dock.setBadge(text)` delegates to `window.electronAPI.dockSetBadge` and `app.setBadgeCount(count)` delegates to `window.electronAPI.setBadgeCount` with the same arguments
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 6. Checkpoint — Verify bridge adapter and detection
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Migrate Group A imports (`@todesktop/client-core` → bridge adapter)
  - [x] 7.1 Migrate `apps/web/components/Providers/DesktopProtocolUrlHandler.tsx`
    - Replace `@todesktop/client-core` imports with `@/utils/electron-bridge`
    - Rename `ToDesktopOpenProtocolUrlEvent` to `DesktopProtocolUrlEvent`
    - _Requirements: 12.1, 15.1_

  - [x] 7.2 Migrate `apps/web/components/Titlebar/index.tsx` and `apps/web/components/NavigationBar/index.tsx`
    - Replace `nativeWindow` import source
    - _Requirements: 12.1, 15.1_

  - [x] 7.3 Migrate `apps/web/components/DesktopAppNavigationButtons.tsx`
    - Replace `webContents` import; migrate `window.todesktop.contents.goBack()` / `goForward()` direct calls to `webContents.goBack()` / `webContents.goForward()` from bridge adapter
    - _Requirements: 9.1, 9.2, 12.1, 15.1_

  - [x] 7.4 Migrate `apps/web/components/Layout/AppLayout.tsx` and `apps/web/components/Providers/AuthProvider.tsx`
    - Replace `nativeWindow` and `appMenu` import sources
    - _Requirements: 12.1, 15.1_

  - [x] 7.5 Migrate `apps/web/components/Call/ScreenShareControls.tsx` and `apps/web/components/Call/DesktopScreenShareSourcesDialog.tsx`
    - Replace `systemPreferences` and `app` / `CaptureSource` type imports
    - Update `CaptureSource` import from `@todesktop/client-core/app` to bridge adapter
    - _Requirements: 7.2, 8.1, 12.2, 15.1_

  - [x] 7.6 Migrate hooks: `useGetUnreadNotificationsCount.ts`, `useAVPermissionState.ts`, `useBindCurrentUserEventOnceInDesktopApp.ts`
    - Replace `app` and `systemPreferences` import sources
    - _Requirements: 6.1, 8.1, 12.1, 15.1_

  - [x] 7.7 Migrate `apps/web/hooks/useCreateDesktopOrBrowserNotification.tsx`
    - Replace `nativeWindow` import source
    - Set notification icon explicitly for desktop (remove `isDesktop ? undefined : ...` conditional)
    - _Requirements: 12.1, 15.1, 17.1_

  - [x] 7.8 Migrate OAuth hooks: `useHandleLinearConnectionSuccess.ts` and `useHandleFigmaConnectionSuccess.ts`
    - Replace `app` import source
    - Update `ToDesktopOpenProtocolUrlEvent` references to `DesktopProtocolUrlEvent`
    - _Requirements: 12.1, 12.4, 15.1_

  - [x] 7.9 Migrate `packages/ui/src/Link/Link.tsx` and `packages/ui/src/Link/utils.ts`
    - Replace `@todesktop/client-core` and `@todesktop/client-core/platform` imports with bridge adapter
    - Map `os` import from platform sub-path to bridge adapter's `os` export
    - _Requirements: 12.1, 15.1_

  - [x] 7.10 Migrate `apps/web/pages/[org]/calls/join/[callRoomId]/index.tsx`
    - Replace `nativeWindow` import source
    - _Requirements: 12.1, 15.1_

- [x] 8. Checkpoint — Verify all import migrations compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update configuration and remove Todesktop dependencies
  - [x] 9.1 Update `apps/web/next.config.js` to remove `todesktop-internal:` CSP directive
    - _Requirements: 15.3_

  - [x] 9.2 Remove Todesktop error filters from `apps/web/sentry.client.config.ts` and `apps/site/sentry.client.config.ts`
    - Remove the `'window.todesktop._.onNotificationCreated is not a function'` error filter
    - _Requirements: 15.4_

  - [x] 9.3 Update `apps/site/next.config.js` download redirect
    - Change `/desktop/download` redirect from `https://dl.todesktop.com/221108gwi9omzf9` to the GitHub Releases URL
    - _Requirements: 16.3_

  - [x] 9.4 Remove `@todesktop/client-core` from `apps/web/package.json`, `packages/ui/package.json`, and `pnpm-workspace.yaml` catalog
    - _Requirements: 15.1, 15.2_

  - [ ]* 9.5 Write property test for API surface coverage
    - **Property 6: API surface coverage**
    - Verify that for every `@todesktop/client-core` import used in the codebase, a corresponding export exists in the bridge adapter with an identical call signature
    - **Validates: Requirements 12.1, 12.2**

- [x] 10. Checkpoint — Verify clean build with no Todesktop references
  - Ensure all tests pass, verify zero imports from `@todesktop/client-core` remain, ask the user if questions arise.

- [x] 11. Wire packaging, auto-updates, and final integration
  - [x] 11.1 Configure electron-builder packaging for macOS and Windows
    - Ensure `electron-builder.yml` produces `.dmg` (macOS) and `.exe`/`.nsis` (Windows) installers
    - Configure macOS notarization via `@electron/notarize`
    - Configure `electron-updater` GitHub provider with correct owner/repo
    - _Requirements: 16.1, 16.2, 16.4_

  - [ ]* 11.2 Write property test for window registry lifecycle integrity
    - **Property 2: Window registry lifecycle integrity**
    - Verify that after any sequence of create/close operations, the Window_Registry contains exactly the set of windows created but not yet closed
    - **Validates: Requirements 3.5, 3.6, 3.8**

  - [ ]* 11.3 Write property test for CaptureSource structure completeness
    - **Property 5: CaptureSource structure completeness**
    - Verify every CaptureSource returned by `app.getCaptureSources()` has a non-empty `id`, non-empty `name`, and valid base64 data URL `thumbnail`
    - **Validates: Requirement 7.2**

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate universal correctness properties from the design document
- The 46 files identified in the design are covered across tasks 5, 7, and 9 (Groups A–F)
- Group E files (behavior-dependent, no code changes) should be manually verified after migration
- Group F files (server-side desktop auth) require no code changes but should be tested end-to-end
