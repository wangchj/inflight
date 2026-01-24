# Windows MSIX Build

This document describes how to make Windows MSIX distributable.

Make sure that `.env` exists and has the keys defined in `forge.config.ts`
`@electron-forge/maker-msix` section

Run the following

```
npm run make -- --arch=x64,arm64
```

After the steps, the distributables for will be output to `out/make/msix/`.
