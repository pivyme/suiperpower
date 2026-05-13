---
name: eve-frontier
description: Use when building for the EVE Frontier track on Sui (game-economy integration).
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track eve-frontier build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track eve-frontier build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Guides the user through building a Smart Assembly extension for EVE Frontier on Sui. Picks the right assembly type (Turret, Gate, or StorageUnit), scaffolds from the official builder-scaffold repo, writes the Move extension logic using the typed witness pattern, tests locally with Docker, deploys to testnet, and registers the extension with the assembly. The user ends up with a working, deployable game mod.

## When to use it

- The user wants to build for the EVE Frontier track at Sui Overflow 2026.
- The user mentions Smart Assemblies, Turrets, Gates, or Storage Units in the EVE context.
- The user wants to mod EVE Frontier gameplay with on-chain logic.
- The user wants to build a vending machine, access gate, or targeting system in EVE Frontier.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user wants general Sui Move development (not EVE-specific), use `build-with-move`.
- If the user wants to store data on Walrus outside EVE context, use `walrus-storage`.
- If the user wants to deploy a non-EVE project, use `deploy-to-testnet`.
- If the user wants to learn about Sui before building, use `sui-beginner` or `virtual-sui-incubator`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's game mod idea (what behavior they want to create in EVE Frontier).
- Optional: `.suiperpower/build-context.md` from prior skills. Read it if present.
- Docker installed (required for local testing with the EVE dev environment).

If the user is unsure what to build, interview for:

- What gameplay behavior do you want to change? (targeting, access, trading)
- Do you want to interact with other players' assemblies?
- Does your mod need external data (oracles, Walrus storage, Seal encryption)?

## Outputs

- A Move package implementing one or more Smart Assembly extensions using the typed witness pattern.
- Local test results from Docker-based dev environment.
- Testnet deployment with package ID.
- Extension registration with the target assembly via `authorize_extension`.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## eve-frontier session, <timestamp>
  - assembly type: <turret | gate | storage_unit>
  - extension function: <get_target_priority_list | issue_jump_permit | deposit/withdraw wrapper>
  - auth witness: <module::StructName>
  - package id (testnet): <id or pending>
  - extension registered: <yes | pending>
  - uses: <walrus | seal | zklogin | none>
  - open issues: <list>
  ```

## Decision table: which assembly type

| Use case | Assembly type | Extension pattern |
|---|---|---|
| Custom targeting logic (friend/foe, priority, conditional) | Turret (`world::turret`) | Implement `get_target_priority_list`, return BCS-encoded priority list. Uses OnlineReceipt hot potato. |
| Access control for travel (allowlist, token-gate, reputation, paid entry) | Gate (`world::gate`) | Issue `JumpPermit` via `gate::issue_jump_permit`. Permit model, not bool return. |
| Vending machine, trading post, item exchange | StorageUnit (`world::storage_unit`) | Wrap `deposit_item`/`withdraw_item` with your Auth witness and business logic. No hook function. |

If the user's idea spans two types (e.g., a gate that also sells access passes via a storage unit), start with the primary type and extend. Each assembly is a separate module; they compose through shared state or cross-module calls.

## Workflow

### 1. Context gathering

- Read `.suiperpower/build-context.md` if it exists.
- Confirm the user's mod idea. Map it to an assembly type using the decision table above.
- Confirm Docker is available (`docker --version`). Flag if missing: local testing requires it.

### 2. Clone and explore the scaffold

- Clone the builder-scaffold repo: `git clone https://github.com/evefrontier/builder-scaffold`.
- Walk through the scaffold structure with the user. Identify the hook entry points for the chosen assembly type.
- Fetch the latest docs at https://docs.evefrontier.com/ for any changes since this skill was written.

### 3. Write the Move extension logic

- Define your Auth witness struct (e.g., `public struct MyAuth has drop {}`).
- Implement the extension function for the chosen assembly type:
  - **Turret**: `get_target_priority_list(turret, character, candidates, receipt) -> vector<u8>`. Must consume the `OnlineReceipt` hot potato via `turret::destroy_online_receipt<MyAuth>`. Decode input with `turret::unpack_candidate_list()`, encode output with `bcs::to_bytes()`.
  - **Gate**: call `gate::issue_jump_permit<MyAuth>()` or `gate::issue_jump_permit_with_id<MyAuth>()` after your access checks. No bool return.
  - **StorageUnit**: wrap `storage_unit::deposit_item<MyAuth>()` / `storage_unit::withdraw_item<MyAuth>()` with your business logic.
- Follow the patterns in `references/eve-assembly-types.md` for the correct function signatures and return types.
- If the mod needs external integrations (Walrus for asset storage, Seal for encrypted data, zkLogin for identity), wire them in. Reference the relevant suiperpower skills for those integrations.
- Keep the extension logic minimal and focused. Complex business logic should live in separate modules that the extension calls.

### 4. Test locally with Docker

- Spin up the local EVE dev environment using the scaffold's Docker setup.
- Deploy the Move package to the local environment.
- Test the extension: trigger the assembly and verify the behavior matches the user's intent.
- Test edge cases: what happens with invalid input, unauthorized callers, concurrent interactions.

### 5. Deploy to testnet

- Build the Move package: `sui move build`.
- Deploy to Sui testnet: `sui client publish --gas-budget 100000000`.
- Record the package ID and relevant object IDs.

### 6. Register extension with the assembly

- The assembly owner calls your module's register function, which internally calls `authorize_extension<YourAuth>()` on the assembly.
- This requires the owner's `OwnerCap<Turret>`, `OwnerCap<Gate>`, or `OwnerCap<StorageUnit>`.
- Follow the registration flow from the builder docs (https://docs.evefrontier.com/).
- Verify the extension is active: the assembly's `extension` field should contain your type name.

### 7. Writeback

- Test the assembly in-game (or via the local dev environment if mainnet is not accessible).
- Append session details to `.suiperpower/build-context.md`.

### 8. Closing handoff

- If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
- If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does the Move package compile with `sui move build`?
- Does the extension function follow the correct signature for the chosen assembly type (see `references/eve-assembly-types.md`)?
- Was the assembly tested locally (Docker) with at least one positive and one negative case?
- Is the package deployed to testnet with a confirmed package ID?
- Was extension registration with the assembly attempted (or documented as the next step if testnet world is not available)?
- If external integrations were used (Walrus, Seal, zkLogin), do they actually work end-to-end?
- Is the mod idea clearly different from the scaffold defaults (not just a clone with no changes)?

If any answer is no, the skill reports the gap and works through it before claiming the build is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/eve-quickstart.md`: Setup, scaffold cloning, Docker environment, deploy flow.
- `references/eve-assembly-types.md`: Three assembly types with extension function signatures, typed witness pattern, and actual struct/type names.

External docs (fetch at runtime for the latest API surface):

- EVE Frontier Builder Docs: https://docs.evefrontier.com/
- World Contracts Repo: https://github.com/evefrontier/world-contracts
- Builder Scaffold Repo: https://github.com/evefrontier/builder-scaffold

## Use in your agent

- Claude Code: `claude "/suiper:eve-frontier <your message>"`
- Codex: `codex "/eve-frontier <your message>"`
- Cursor: paste a chat message that includes a phrase like "EVE Frontier" or "Smart Assembly", or load `~/.cursor/rules/eve-frontier.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
