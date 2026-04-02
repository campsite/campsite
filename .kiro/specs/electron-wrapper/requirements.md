# Requirements Document

## Introduction

This document defines the requirements for replacing the paid `@todesktop/client-core` service with a self-managed Electron wrapper for the Campsite desktop application. The migration preserves all existing desktop functionality — custom protocol handling, native window management, dock badge counts, screen share source picking, AV permission checks, app menu customization, OAuth deep-link interception, and auto-updates — while eliminating the $100/year dependency on a third-party service.

## Glossary

- **Main_Process**: The Electron main process (`apps/desktop/src/main.ts`) that manages BrowserWindows, registers protocol handlers, handles IPC, and manages auto-updates.
- **Preload_Script**: The Electron preload script (`apps/desktop/src/preload.ts`) that securely exposes a subset of Electron APIs to the renderer via `contextBridge`.
- **Bridge_Adapter**: The drop-in replacement module (`apps/web/utils/electron-bridge.ts`) that maps the existing `@todesktop/client-core` API surface to `window.electronAPI` calls.
- **Renderer**: The Next.js web application running inside the Electron BrowserWindow.
- **Window_Registry**: An in-memory map in the Main_Process that tracks all created BrowserWindow instances by UUID reference.
- **Protocol_Handler**: The component that registers and processes `campsite://` (production) or `campsite-dev://` (development) custom protocol URLs.
- **Auto_Updater**: The component that checks for, downloads, and installs application updates via GitHub Releases using `electron-updater`.
- **IPC_Channel**: A named communication channel between the Main_Process and the Renderer, mediated by the Preload_Script.
- **CaptureSource**: A data object representing a screen or window available for screen sharing, containing an id, name, and base64 thumbnail.
- **Desktop_Detection**: The logic that determines whether the application is running inside the Electron wrapper or in a standard browser.

## Requirements

### Requirement 1: Desktop Application Detection

**User Story:** As a developer, I want a reliable way to detect whether the app is running inside the Electron wrapper, so that desktop-specific features are enabled only in the correct context.

#### Acceptance Criteria

1. WHEN the Renderer loads inside the Electron wrapper, THE Desktop_Detection SHALL return `true` by checking for the presence of `window.electronAPI`
2. WHEN the Renderer loads inside a standard browser, THE Desktop_Detection SHALL return `false`
3. WHEN the Renderer loads in a server-side rendering context, THE Desktop_Detection SHALL return `false`
4. WHILE the legacy `window.todesktop` object is present, THE Desktop_Detection SHALL return `true` to support backward compatibility during migration

### Requirement 2: Secure IPC Communication

**User Story:** As a developer, I want all communication between the renderer and main process to go through a secure, explicitly defined bridge, so that the application maintains strong security boundaries.

#### Acceptance Criteria

1. THE Preload_Script SHALL expose the bridge API via `contextBridge.exposeInMainWorld` with `contextIsolation` set to `true`
2. THE Main_Process SHALL set `nodeIntegration` to `false` for all BrowserWindow instances
3. THE Preload_Script SHALL wrap each IPC call in a typed function rather than exposing `ipcRenderer` directly
4. THE Main_Process SHALL register only explicitly named IPC_Channel handlers with no wildcard patterns

### Requirement 3: Window Management

**User Story:** As a user, I want to manage desktop windows (maximize, minimize, restore, close, create), so that I can interact with the app using standard desktop conventions.

#### Acceptance Criteria

1. WHEN the Renderer invokes `nativeWindow.maximize()`, THE Main_Process SHALL maximize the focused BrowserWindow
2. WHEN the Renderer invokes `nativeWindow.minimize()`, THE Main_Process SHALL minimize the focused BrowserWindow
3. WHEN the Renderer invokes `nativeWindow.restore()`, THE Main_Process SHALL restore the focused BrowserWindow from maximized or minimized state
4. WHEN the Renderer invokes `nativeWindow.close()`, THE Main_Process SHALL close the focused BrowserWindow
5. WHEN the Renderer invokes `nativeWindow.create(options)`, THE Main_Process SHALL create a new BrowserWindow, assign it a UUID, store it in the Window_Registry, and return the UUID
6. WHEN a BrowserWindow is closed, THE Main_Process SHALL remove the corresponding entry from the Window_Registry
7. WHEN the Renderer invokes `nativeWindow.show(ref)` with a valid reference, THE Main_Process SHALL show the referenced BrowserWindow
8. WHEN the Renderer invokes `nativeWindow.getAllWindows()`, THE Main_Process SHALL return a list of all tracked window references

### Requirement 4: Main Window Creation

**User Story:** As a user, I want the desktop app to launch with a properly configured main window loading the web application, so that I can use the app immediately.

#### Acceptance Criteria

1. WHEN the Electron app is ready, THE Main_Process SHALL create a BrowserWindow with `titleBarStyle: 'hiddenInset'` on macOS or `frame: false` on Windows/Linux
2. THE Main_Process SHALL load the web application URL (`WEB_URL`) in the main BrowserWindow
3. THE Main_Process SHALL attach the Preload_Script via `webPreferences.preload`
4. THE Main_Process SHALL enforce minimum window size constraints of 800px width and 600px height
5. WHEN the macOS dock icon is clicked and no windows exist, THE Main_Process SHALL create a new main window
6. WHEN the macOS dock icon is clicked and a window exists, THE Main_Process SHALL show the existing main window

### Requirement 5: Custom Protocol Handling

**User Story:** As a user, I want `campsite://` links to open in the desktop app, so that OAuth callbacks, deep links, and call joins work seamlessly.

#### Acceptance Criteria

1. THE Protocol_Handler SHALL register the app as the default handler for `campsite://` in production and `campsite-dev://` in development
2. WHEN the OS delivers a protocol URL on macOS, THE Main_Process SHALL intercept the `open-url` event and forward the URL to the Renderer
3. WHEN the OS delivers a protocol URL on Windows via a second instance launch, THE Main_Process SHALL parse the `--open-url` command line argument and forward the URL to the Renderer
4. WHEN a protocol URL contains `/calls/join/`, THE Main_Process SHALL create a new call window and load the URL in that window
5. WHEN a protocol URL contains `://auth/desktop`, THE Main_Process SHALL forward the URL to the main window Renderer for auth processing
6. IF a protocol URL arrives before any BrowserWindow exists, THEN THE Main_Process SHALL queue the URL and deliver it after the main window finishes loading

### Requirement 6: Dock Badge and Notification Count

**User Story:** As a user, I want to see unread notification counts on the dock icon, so that I know when there are new items to review without switching to the app.

#### Acceptance Criteria

1. WHEN the Renderer invokes `app.dock.setBadge(text)` on macOS, THE Main_Process SHALL update the dock badge to display the provided text
2. WHEN the Renderer invokes `app.setBadgeCount(count)`, THE Main_Process SHALL update the OS-level badge count
3. THE Bridge_Adapter SHALL delegate badge calls to `window.electronAPI.dockSetBadge` and `window.electronAPI.setBadgeCount` respectively

### Requirement 7: Screen Capture Source Enumeration

**User Story:** As a user, I want to pick a screen or window to share during calls, so that I can present content to other participants.

#### Acceptance Criteria

1. WHEN the Renderer invokes `app.getCaptureSources(options)`, THE Main_Process SHALL enumerate available screen and window sources using `desktopCapturer.getSources`
2. THE Main_Process SHALL return each CaptureSource with an `id`, `name`, and `thumbnail` encoded as a base64 data URL
3. THE Main_Process SHALL accept `types` (array of `'window'` or `'screen'`) and `thumbnailSize` as options

### Requirement 8: Media Permission Management

**User Story:** As a user, I want the app to check and request camera and microphone permissions, so that I can participate in calls with audio and video.

#### Acceptance Criteria

1. WHEN the Renderer invokes `systemPreferences.getMediaAccessStatus(mediaType)`, THE Main_Process SHALL return the current permission status for the specified media type
2. WHEN the Renderer invokes `systemPreferences.askForMediaAccess(mediaType)`, THE Main_Process SHALL trigger the OS permission prompt and return the result

### Requirement 9: Navigation Controls

**User Story:** As a user, I want back and forward navigation buttons in the desktop app, so that I can navigate through my browsing history.

#### Acceptance Criteria

1. WHEN the Renderer invokes `webContents.goBack()`, THE Main_Process SHALL navigate the sender's webContents backward in history
2. WHEN the Renderer invokes `webContents.goForward()`, THE Main_Process SHALL navigate the sender's webContents forward in history
3. WHEN the Renderer invokes `webContents.canGoBack()`, THE Main_Process SHALL return whether backward navigation is available
4. WHEN the Renderer invokes `webContents.canGoForward()`, THE Main_Process SHALL return whether forward navigation is available
5. WHEN the Renderer invokes `webContents.loadURL(ref, url)`, THE Main_Process SHALL load the specified URL in the referenced window

### Requirement 10: Application Menu Management

**User Story:** As a user, I want a native application menu with keyboard shortcuts, so that I can access common actions quickly.

#### Acceptance Criteria

1. WHEN the Renderer invokes `appMenu.add(menu, label, callback, options)`, THE Main_Process SHALL store the menu item configuration
2. WHEN the Renderer invokes `appMenu.refresh()`, THE Main_Process SHALL rebuild and apply the native application menu with all registered items

### Requirement 11: Auto-Update via GitHub Releases

**User Story:** As a user, I want the desktop app to update itself automatically, so that I always have the latest version without manual intervention.

#### Acceptance Criteria

1. WHEN the packaged app launches, THE Auto_Updater SHALL check GitHub Releases for available updates
2. THE Auto_Updater SHALL check for updates periodically every 4 hours
3. WHEN an update is available, THE Auto_Updater SHALL download the update silently in the background
4. WHEN an update has been downloaded, THE Auto_Updater SHALL install the update on the next application quit
5. IF the update check or download fails, THEN THE Auto_Updater SHALL log the error and continue running the current version without displaying an error to the user
6. WHILE the app is running in development mode, THE Auto_Updater SHALL remain disabled

### Requirement 12: Bridge Adapter API Compatibility

**User Story:** As a developer, I want a drop-in replacement for `@todesktop/client-core`, so that existing components require only an import path change with no other code modifications.

#### Acceptance Criteria

1. THE Bridge_Adapter SHALL export `app`, `nativeWindow`, `webContents`, `systemPreferences`, `appMenu`, `os`, and `newApp` objects matching the call signatures used by existing `@todesktop/client-core` consumers
2. THE Bridge_Adapter SHALL re-export the `CaptureSource` type so consumers that imported it from `@todesktop/client-core/app` can import it from the Bridge_Adapter
3. WHEN `app.once('registerProtocolUrlListeners', callback)` is invoked, THE Bridge_Adapter SHALL call the callback immediately since the Electron bridge is available as soon as the Renderer loads
4. WHEN `app.on('openProtocolURL', callback)` is invoked, THE Bridge_Adapter SHALL register a listener on `window.electronAPI.onProtocolURL` and translate the event format
5. WHEN `newApp.on('activate', callback)` is invoked, THE Bridge_Adapter SHALL register a listener on `window.electronAPI.onActivate` and return an unsubscribe function

### Requirement 13: Graceful Browser Fallback

**User Story:** As a developer, I want bridge functions to no-op gracefully when running outside Electron, so that shared code does not throw errors in browser contexts.

#### Acceptance Criteria

1. WHEN `window.electronAPI` is undefined, THE Bridge_Adapter SHALL resolve all Promise-returning functions with sensible defaults (empty arrays, `false`, `void`)
2. WHEN `window.electronAPI` is undefined, THE Bridge_Adapter SHALL execute event registration functions as no-ops without throwing errors

### Requirement 14: Single Instance Lock

**User Story:** As a user, I want only one instance of the desktop app running at a time, so that protocol URLs and window management behave predictably.

#### Acceptance Criteria

1. THE Main_Process SHALL request a single instance lock on startup
2. IF a second instance is launched, THEN THE Main_Process SHALL quit the second instance and focus the existing main window
3. WHEN a second instance is launched with a protocol URL argument on Windows, THE Main_Process SHALL forward the URL to the existing instance for processing

### Requirement 15: Import Migration

**User Story:** As a developer, I want all `@todesktop/client-core` imports replaced with the Bridge_Adapter, so that the codebase no longer depends on the paid service.

#### Acceptance Criteria

1. WHEN the migration is complete, THE codebase SHALL contain zero imports from `@todesktop/client-core` or its sub-paths (`@todesktop/client-core/app`, `@todesktop/client-core/platform`)
2. WHEN the migration is complete, THE `@todesktop/client-core` dependency SHALL be removed from `apps/web/package.json`, `packages/ui/package.json`, and the `pnpm-workspace.yaml` catalog
3. THE `apps/web/next.config.js` SHALL remove the `todesktop-internal:` CSP directive
4. THE Sentry client configurations SHALL remove the Todesktop-specific error filters

### Requirement 16: Electron App Packaging and Distribution

**User Story:** As a developer, I want the Electron app packaged and distributed via GitHub Releases, so that users can download and install the desktop app.

#### Acceptance Criteria

1. THE `apps/desktop` package SHALL use `electron-builder` for packaging macOS (`.dmg`) and Windows (`.exe`/`.nsis`) installers
2. THE macOS build SHALL be notarized using `@electron/notarize`
3. THE `apps/site/next.config.js` download redirect SHALL point to the GitHub Releases URL instead of the Todesktop download URL
4. THE `apps/desktop/electron-builder.yml` SHALL configure `electron-updater` to use the `github` provider with the correct owner and repo

### Requirement 17: Desktop Notification Icon

**User Story:** As a user, I want desktop notifications to display the app icon, so that I can identify which app sent the notification.

#### Acceptance Criteria

1. WHEN a desktop notification is created inside the Electron wrapper, THE Renderer SHALL set the notification icon explicitly rather than relying on the removed Todesktop auto-icon behavior
