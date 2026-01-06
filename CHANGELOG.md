# CHANGELOG.md

## 2.0.0 (2025-01-06)

- Add AWS Signature V4 support for web build.
- Update app icon.
- Schema version 2.0: rename "environment group" to "dimension" and "environment" to "variant".

## 1.7.1 (2025-12-22)

- Add support for aws login CLI credentials.
- Update sign-request-sigv4.ts to use AWS SDK fromNodeProviderChain credentials provider.
- Use default AWS CLI profile when profile is not specified.

## 1.6.0 (2025-12-16)

- Add UI component to show request TLS cipher.
- Expose window controls for Windows/Linux.
- Update main window loadURL for Windows build.
- Add @electron-forge/maker-appx
- Add new project modal.
- Add web build.
- Update variable input component to set caret position only when it's focused.

## 1.5.1 (2025-11-03)

- Fix the UI crash when switching from a tab with response to a tab without response.

## 1.5.0 (2025-10-31)

- Add response network tab that contains local and remote network info and remote TLS certificate info.

## 1.4.2 (2025-10-29)

- Re-render variable inputs after environment selections change.

## 1.4.1 (2025-10-28)

- Fix the bug that resolved variables is undefined after opening a project.

## 1.4.0 (2025-10-11)

- Color unresolved input variables red.
- Remove unused request config content type dropdown.

## 1.3.0 (2025-08-29)

- Allow opening a project by dragging a file from the OS and dropping into the app when no project is open.
- Prevent stale AWS CLI profile creds by setting ini provider ignoreCache to true.
- Fix the issue that titlebar and footer disappears when content overflows.
- Default to show request body tab if request has playload.
- Add input UI component that highlights variables.

## 1.2.0 (2025-07-11)

- Improve project tree drag and drop support. Allow drag item into empty folder.
- Update layout and color scheme.

## 1.1.0 (2025-07-11)

- Allow moving and reordering project tree items by dragging.
- Add CHANGELOG.md.