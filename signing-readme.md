# fix signing issues
We hebben nodig een p12 file uit je keychain.app

Hiervoor moeten we een op de huidige mac aangevraagd certificaat hebben

- keychain.app
- menu bar -> certificate assistant -> request from a certificate authority (name eg: timmerdorp 2022)
- save to disk
- use certificate request file to create certificate in developer.apple.com -> certificates (ios distribution app store)

Hiermee vervolgens een provisioning profile aanmaken

fyi: https://github.com/yukiarrr/ios-build-action

upload base64 variants to github actions secrets

### secrets example:
- APP_CENTER_TOKEN=?
- CODE_SIGNING_IDENTITY=iOS Distribution?
- MOBILEPROVISION_BASE64=file in base64
- P12_BASE64=file in base64
- TEAM_ID=85F3ZNA6NH
