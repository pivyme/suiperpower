---
name: build-mobile-sui
description: Build a mobile Sui app using the Sui Mobile SDK or React Native bindings, with deep-link wallet flows and on-device key custody. Use when the user says "build a mobile Sui app", "Sui Mobile SDK", "React Native Sui", "iOS Sui app", "Android Sui app", "Sui on phone", or "Sui mobile wallet integration". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/04-protocols-and-sdks.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track build-mobile-sui build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track build-mobile-sui build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Builds a mobile Sui app (React Native, Expo, native Swift/Kotlin) end to end. Sets up the Sui SDK on mobile, picks the right wallet flow (deep-link external wallet, embedded zkLogin, or on-device key custody), wires deep links, and verifies a real transaction signs and settles from the device. Reuses guides for RPC and wallet selection.

## When to use it

- Building a mobile-first Sui product.
- Adding a mobile companion to an existing Sui dapp.
- Targeting consumer audiences who do not use desktop wallets.

## When NOT to use it

- Desktop dapp; use `scaffold-project` and `frontend-design-guidelines` instead.
- Pre-MVP code with no mobile decisions; finish the desktop flow first.
- Pure backend work; mobile is irrelevant.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A mobile dev environment (Xcode, Android Studio, or Expo).
- Optional: `.suiperpower/build-context.md`.
- The chosen wallet flow: external wallet via deep link, embedded zkLogin, or on-device keypair.

If unclear, interview the user for:

- iOS, Android, or both?
- React Native (Expo or bare), Flutter, or native?
- Wallet flow preference?
- Will the app handle high-value funds (custody concerns) or onboarding flows (zkLogin focus)?

## Outputs

- A working mobile project with a Sui client connection, a "connect wallet" path, a "sign and submit" path.
- A real testnet transaction signed from the device, captured by digest.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## build-mobile-sui session, <timestamp>
  - platform: <ios | android | both>
  - framework: <expo | bare-rn | native-swift | native-kotlin>
  - wallet flow: <deeplink | zklogin | on-device>
  - first sponsored / signed tx digest: <digest>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Confirm platform, framework, wallet flow.

2. **SDK setup**
   - For React Native: install `@mysten/sui` and a polyfill bundle (`react-native-get-random-values`, `react-native-quick-crypto`, etc.).
   - For native iOS: use the Swift Sui SDK (or call into a JS engine for the SDK).
   - For native Android: use the Kotlin Sui SDK (or JS engine bridge).

3. **Wallet flow**
   - Deep-link external wallet (Slush, Suiet, etc.): set up universal links / app links, define the request format, handle the callback.
   - Embedded zkLogin: hand off to `sui-zk-login` for the OAuth + prover flow, adapt the redirect handling for mobile.
   - On-device keypair: generate, store in Keychain (iOS) or Keystore (Android), never plain prefs.

4. **First transaction**
   - Construct a simple Sui tx (e.g. a coin transfer or a contract call).
   - Sign on the device (or via wallet deep-link).
   - Submit to testnet, capture the digest.

5. **Deep-link plumbing**
   - Set up the universal-link / app-link entitlements.
   - Test that the OS opens the wallet app on tap, returns with the signature, and your app re-launches.

6. **Key custody**
   - For on-device keys, write the secure-storage abstraction with explicit error handling on biometric failure.
   - For zkLogin, the ephemeral key lives in secure storage with a max-epoch TTL.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new mobile wallet flow, on-device key custody, deep-link plumbing, first real on-chain tx from the device), recommend `verify-against-intent` as the next step so the auth and custody choices are checked before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real signed transaction settle on testnet from the device, with the digest captured?
- For deep-link flows, does the round-trip wallet-launch-and-return actually work on a real device, not just in a simulator?
- For on-device keys, is the private key stored in Keychain or Keystore, never in `AsyncStorage` or plain user defaults?
- For zkLogin flows, is the ephemeral key TTL enforced and the proof refreshed when expired?
- Is the Sui RPC endpoint configurable per environment (testnet vs mainnet) via app config?
- Does the app gracefully handle the wallet-not-installed case with a helpful message and an install link?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/mobile-sdk-setup.md`: SDK install + polyfill notes for React Native, Expo, native iOS, native Android.
- `references/wallet-flow-options.md`: Deep-link, zkLogin, on-device key flows with platform-specific notes.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK ecosystem context.
- `skills/data/guides/rpc-wallet-guide.md`: Sui-native RPC endpoints and wallet picks.

## Use in your agent

- Claude Code: `claude "/suiper:build-mobile-sui <your message>"`
- Codex: `codex "/build-mobile-sui <your message>"`
- Cursor: paste a chat message that includes a phrase like "build a mobile Sui app", or load `~/.cursor/rules/build-mobile-sui.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
