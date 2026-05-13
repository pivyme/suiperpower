---
name: suins-integration
description: Integrate SuiNS names into a Sui dapp. Use when the user mentions SuiNS or wants name resolution on Sui.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track suins-integration build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track suins-integration build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates SuiNS name resolution and/or Move Registry (MVR) named packages into a Sui project. On the resolution side: resolve `.sui` names to addresses, reverse-lookup addresses to names, and read name metadata. On the registration side: register names, set target addresses, set default names, and attach user data (e.g., Walrus site IDs). On the MVR side: replace raw package addresses with human-readable `@org/package` names in Move dependencies and TypeScript transaction builds.

## When to use it

- The project needs to resolve `.sui` names to Sui addresses (forward lookup).
- The project needs to display a `.sui` name for a given address (reverse lookup).
- The user wants to register a `.sui` name programmatically.
- The user wants to set user data on a SuiNS name (avatar, Walrus site, custom fields).
- The user wants to use MVR named packages instead of raw hex addresses in Move or TypeScript.
- The user is building a profile page, social feature, or any UI where addresses should be human-readable.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user wants to build a full name service from scratch (not integrate SuiNS), use `build-with-move`.
- If the user only needs to deploy a package and does not care about named packages, use `deploy-to-testnet`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with a TypeScript frontend or backend, OR a Move package that needs MVR dependencies.
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The user's intent: name resolution, name registration, MVR integration, or a combination.

If unclear, interview the user for:

- Do you need to resolve names (read), register names (write), or both?
- Is this for a frontend (display names) or backend (programmatic lookup)?
- Do you want to use MVR named packages in your Move dependencies or TypeScript builds?
- Which network: mainnet, testnet?

## Outputs

- TypeScript integration code using `@mysten/suins` for resolution and/or registration.
- Optional: MVR CLI setup and `namedPackagesPlugin` wiring for TypeScript transaction builds.
- Optional: `Move.toml` updates for MVR-resolved dependencies via `mvr add`.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## suins-integration session, <timestamp>
  - features: <resolution | registration | mvr | combination>
  - package: @mysten/suins
  - network: <mainnet | testnet>
  - mvr packages added: <list or none>
  - open issues: <list>
  ```

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the user's intent: resolution, registration, MVR, or all three.
   - Check if the project already has `@mysten/sui` installed (peer dependency for `@mysten/suins`).

2. **Install dependencies**
   - `npm install @mysten/suins` (or pnpm/yarn equivalent).
   - Confirm `@mysten/sui` is already installed as a peer dependency. If not, install it.
   - For MVR: `npm install -g @aspect-run/mvr` for the CLI, or `@mysten/sui` already includes `namedPackagesPlugin`.

3. **Name resolution (if needed)**
   - Initialize `SuinsClient` with the user's `SuiClient` and target network.
   - Wire forward lookup: `suinsClient.getNameRecord('name.sui')` returns a `NameRecord` with `targetAddress`, `expirationTimestampMs`, `avatar`, `walrusSiteId`, and other metadata. Returns `null` if the name does not exist or is expired.
   - The SDK does not expose standalone `getAddress()` or `getName()` methods. Use `getNameRecord()` for all resolution.
   - See `references/suins-quickstart.md` for the full API surface.

4. **Name registration (if needed)**
   - Use `SuinsTransaction` for registration mutations.
   - Wire `register()` with domain, years, `coinConfig` (SUI, USDC, or NS), payment coin, `maxAmount`, and `priceInfoObjectId` (required for SUI/NS, not USDC).
   - Wire `renew()` to extend an existing name's registration period.
   - Wire `setTargetAddress()` to point the name at a Sui address.
   - Wire `setDefault()` to set the reverse-lookup name for the signer.
   - Wire `setUserData()` for custom key-value pairs (Walrus site, avatar, etc.).
   - Wire `burnExpired()` to destroy expired names and recover storage deposits.
   - See `references/suins-quickstart.md` for registration patterns and pricing.

5. **MVR integration (if needed)**
   - For Move: run `mvr add @org/package --network mainnet` to add named dependencies.
   - For TypeScript: use `namedPackagesPlugin` from `@mysten/sui/transactions` to resolve `@org/package` in PTBs at build time or runtime.
   - For build-time resolution (no runtime network call): use `@mysten/mvr-static`.
   - See `references/suins-quickstart.md` for MVR setup details.

6. **Test the integration**
   - For resolution: resolve a known `.sui` name and confirm it returns the expected address.
   - For registration: if on testnet, attempt a registration flow end-to-end.
   - For MVR: confirm named packages resolve correctly in a transaction build.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

8. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Pricing reference (SuiNS name registration)

Base prices per year in USDC (SUI/NS amounts fluctuate via Pyth oracle):

| Name length | Cost per year (USDC) |
|---|---|
| 3 characters | ~500 |
| 4 characters | ~100 |
| 5+ characters | ~20 |

Three payment options: SUI, USDC, NS token. SUI and NS require a `priceInfoObjectId` from the Pyth price feed. USDC does not. Use `suinsClient.calculatePrice()` for exact amounts. Surface this table when the user is registering names so they understand the cost before committing a transaction.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Is `@mysten/suins` installed (not an older/incorrect package name)?
- Does the `SuinsClient` use the correct network matching the user's deployment target?
- For resolution: does a forward lookup actually return an address (tested with a known name)?
- For registration: is the payment coin and `priceInfoObjectId` correctly sourced (not hardcoded stale values)?
- For MVR: do named packages resolve without runtime errors?
- Are error cases handled (name not found, name expired, network mismatch)?
- Does `setDefault` only run when the signer matches the target address?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/suins-quickstart.md`: SuinsClient init, resolution API, registration API, MVR setup, and code examples.
- `references/suins-pitfalls.md`: Common mistakes with SuiNS integration and how to avoid them.

External docs (fetch at runtime for the latest API surface):

- SuiNS SDK: https://sdk.mystenlabs.com/typedoc/suins
- SuiNS docs: https://docs.suins.io
- MVR docs: https://docs.mvr.land
- MVR CLI: https://www.npmjs.com/package/@aspect-run/mvr

## Use in your agent

- Claude Code: `claude "/suiper:suins-integration <your message>"`
- Codex: `codex "/suins-integration <your message>"`
- Cursor: paste a chat message that includes a phrase like "SuiNS" or "name resolution", or load `~/.cursor/rules/suins-integration.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
