# Mobile Sui SDK setup

Notes for getting the Sui SDK running on the major mobile stacks.

## React Native + Expo

The `@mysten/sui` SDK targets browsers and Node. On React Native, polyfills are required for crypto and randomness.

```bash
pnpm add @mysten/sui react-native-get-random-values react-native-quick-crypto
```

`metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
  crypto: require.resolve("react-native-quick-crypto"),
  buffer: require.resolve("@craftzdog/react-native-buffer"),
  stream: require.resolve("readable-stream"),
};
module.exports = config;
```

Top of your entry file:

```ts
import "react-native-get-random-values";
import "react-native-quick-crypto";
import { Buffer } from "@craftzdog/react-native-buffer";
global.Buffer = Buffer;
```

If a runtime error mentions a missing symbol from `crypto` or `randombytes`, the polyfill order is wrong. Re-check.

## React Native bare

Same as Expo but without the Expo config. Add the polyfills via your existing `metro.config.js` and `babel.config.js`. Test on a real device; iOS simulator and Android emulator behave differently for crypto polyfills.

## Native iOS (Swift)

Two paths:

- Use the official Swift Sui SDK if it covers your needs.
- Embed a JS engine (JavaScriptCore) and call into `@mysten/sui` from Swift via a bridge.

For most apps, the Swift SDK is fine. The JS-bridge path is heavier; reserve for when you share a TS codebase with the web app.

## Native Android (Kotlin)

Same as iOS:

- Kotlin Sui SDK if it covers your needs.
- Embed a JS engine (V8 via React Native or Hermes standalone) for code reuse.

For pure-native apps, prefer the Kotlin SDK.

## Configuration per environment

```ts
// config.ts
import { getFullnodeUrl } from "@mysten/sui/client";

export const SUI_NETWORK = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet";
export const SUI_RPC = getFullnodeUrl(SUI_NETWORK);
export const PACKAGE_ID = process.env[`PACKAGE_ID_${SUI_NETWORK.toUpperCase()}`]!;
```

Set the env vars per build configuration (`app.json` or `app.config.ts` in Expo). Do not ship a hardcoded mainnet endpoint in a debug build.

## Deep-link entitlements

iOS (Universal Links):

- Add `applinks:yourapp.example.com` to `Associated Domains` in entitlements.
- Host `apple-app-site-association` at the domain root.

Android (App Links):

- Add intent filters for the URL scheme in `AndroidManifest.xml`.
- Host `assetlinks.json` at the domain root.

Test on real devices. Simulators do not validate the apple-app-site-association reliably.

## Common gotchas

- iOS rejects `Math.random()`-based randomness. Always use the polyfilled `randombytes`.
- React Native's metro bundler caches aggressively; clear with `pnpm start --clear` if a dependency change does not pick up.
- Android release builds strip code aggressively; if SDK functions disappear at runtime, add ProGuard keep rules.
- Bundle size: pulling all of `@mysten/sui` into a mobile bundle is heavy. Use tree-shakeable subpaths (`@mysten/sui/transactions`, etc.) to limit.

Last updated: 2026-05-10.
