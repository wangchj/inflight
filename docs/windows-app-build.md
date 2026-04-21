# Windows App Build

We currently only support zip distributable packages. Run the following to build the packages:

```
npm run make -- --arch=x64,arm64
```

The following computes the SHA256 checksum of the packages:

```
Get-ChildItem -Path "out" -Filter *.zip -Recurse |
    ForEach-Object {
        certutil -hashfile $_.FullName SHA256
    }
```
