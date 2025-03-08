# MacOS App Build

Run the following commands (fish shell):

```
security find-identity -p codesigning -v

# The Apple ID that's associated with the developer account
set -x APPLE_ID <apple_id>

# The app-specific password for notarytool
set -x APPLE_PASSWORD <password>

# The team id of the developer account
set -x APPLE_TEAM_ID <team id>

# The developer ID application certificate identity from running `security find-identity` above.
# The value should look like 'Developer ID Application: xxx (xxx)
set -x APPLE_CERT_ID '<cert id>'
```

## Troubleshooting

- The binary is not signed with a valid Developer ID certificate.
  - https://stackoverflow.com/questions/64168569/electron-notarize-problem-not-signing-all-binaries