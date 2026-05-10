# Mobile wallet flow options

Three real options. Pick based on the audience and the value at risk.

## Option A: external wallet via deep link

Flow:

1. App constructs the tx.
2. App opens the wallet via deep link with the tx data.
3. User reviews and signs in the wallet app.
4. Wallet returns to your app with the signature.
5. Your app submits the tx.

Pros:

- Wallet handles custody. The app never touches private keys.
- Familiar UX for crypto-native users.
- No regulatory exposure for non-custody.

Cons:

- Requires the wallet app to be installed.
- Round-trip UX is bumpier than embedded.
- Each wallet has its own deep-link URL format; you may need per-wallet handlers.

When to use: high-value flows for crypto-native audiences (DeFi, large NFT trades).

## Option B: embedded zkLogin

Flow:

1. App opens an OAuth provider (Google, Apple) in an in-app browser.
2. App captures the JWT, derives the Sui address.
3. App signs transactions with an ephemeral on-device keypair plus zkLogin proof.

Pros:

- Best onboarding UX for non-crypto users.
- No wallet app required.
- Works for first-time Sui users.

Cons:

- Salt management is your problem.
- Recovery story depends on OAuth provider account.
- Mobile-specific quirks (Apple's JWT only on first sign-in, in-app browser caching).

When to use: consumer products targeting non-crypto audiences (games, social, mass-market consumer dapps).

Hand off the implementation to `sui-zk-login`, then adapt the redirect handling for mobile.

## Option C: on-device keypair

Flow:

1. App generates an Ed25519 keypair on first run.
2. Private key stored in Keychain (iOS) or Keystore (Android).
3. App signs and submits transactions directly.

Pros:

- Simplest implementation.
- No external dependency.
- Smooth UX (no app-switching).

Cons:

- The app holds custody. Lose the device, lose the funds.
- Recovery requires backup (mnemonic export, cloud backup, or social recovery).
- Higher liability for value at risk.

When to use: low-stakes apps (loyalty points, achievements, casual gaming) where loss tolerance is high.

## iOS Keychain

```swift
let item: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "sui_private_key",
    kSecValueData as String: privateKeyData,
    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
]
SecItemAdd(item as CFDictionary, nil)
```

`kSecAttrAccessibleWhenUnlockedThisDeviceOnly` ensures the key never leaves the device (no iCloud sync).

For React Native, use `react-native-keychain`:

```ts
import * as Keychain from "react-native-keychain";

await Keychain.setGenericPassword("sui", privateKey, {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});

const creds = await Keychain.getGenericPassword();
```

## Android Keystore

```kotlin
val keyStore = KeyStore.getInstance("AndroidKeyStore")
keyStore.load(null)

val keyGen = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore")
val spec = KeyGenParameterSpec.Builder("sui_key", KeyProperties.PURPOSE_SIGN)
    .setAlgorithmParameterSpec(ECGenParameterSpec("secp256k1"))
    .setUserAuthenticationRequired(true)
    .build()
keyGen.initialize(spec)
keyGen.generateKeyPair()
```

For React Native, `react-native-keychain` handles the platform abstraction.

## Wallet picks for Sui mobile

| Wallet | iOS | Android | Deep link surface |
|---|---|---|---|
| Slush | yes | yes | universal/app links |
| Suiet | yes | yes | wallet-standard with mobile adapter |

(Verify availability and integration shape against the wallet's current docs at integration time.)

## Recovery strategies for on-device keys

- **Mnemonic export**: classic. Show the user 12 to 24 words, force them to confirm.
- **iCloud / Google Backup**: convenient, weaker security. Encrypt before backup.
- **Social recovery**: split key with trusted contacts. Implementation-heavy; skip unless this is the product.

For most starter apps, mnemonic export at first launch is enough. Make the export hard to skip but possible to defer (with a clear "unbacked-up" banner).

Last updated: 2026-05-10.
