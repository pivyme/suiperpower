---
name: sponsored-transactions
description: Add sponsored transactions to a Sui app so the sponsor pays gas while the user signs the move calls. Use when the user says "sponsor user gas", "gasless transactions on Sui", "build a gas station", "pay gas for my users", "sponsor transactions on Sui", or "first-tx-free Sui onboarding". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/04-protocols-and-sdks.md.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"sponsored-transactions","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"sponsored-transactions","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Sets up sponsored transactions so the project pays gas on behalf of users. Stands up a gas station (self-hosted or third-party), wires the dual-signature flow (sponsor signs the gas, user signs the data), and verifies a real sponsored transaction settles on chain before declaring done. Refuses to ship a stub.

## When to use it

- Consumer onboarding where users do not hold SUI and gas friction kills conversion.
- First-action-free flows that let users try the product before funding a wallet.
- Apps using zkLogin where the new address has zero balance after OAuth.
- Moves where the project wants to subsidize gas as a UX or marketing decision.

## When NOT to use it

- For full custodial flows where the project signs everything; that is a different posture.
- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- For mass-market production use, plan for sponsor abuse defenses (rate limit, tx allowlist) early.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project, frontend or full-stack.
- Optional: `.suiperpower/build-context.md`. Read it if present.
- The decision on gas-station shape: self-hosted backend, Mysten gas station, or a third-party.

If unclear, interview the user for:

- Which transactions are sponsored? All, or only specific entry functions?
- What is the per-user / per-day budget?
- Who holds the sponsor's signing key, and where (KMS, env var, hardware)?
- What stops a malicious caller from draining the sponsor (allowlist, rate limit, tx shape constraints)?

## Outputs

- Sponsor-side service code (or config for a third-party) that holds a sponsor key, builds gas data, and signs.
- Client code that constructs the user's tx, hands it to the sponsor, then submits the joint signature.
- A live sponsored transaction on testnet, observable on suiscan, with sponsor and user as separate signers.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## sponsored-transactions session, <timestamp>
  - sponsor address: <0x...>
  - sponsor balance source: <faucet | manual | top-up service>
  - first sponsored tx digest: <digest>
  - allowlist policy: <description>
  - rate limit policy: <description>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm which transactions are sponsored and the abuse model.

2. **Pick the gas-station shape**
   - Self-hosted backend: full control, full ops burden.
   - Mysten gas station service: managed, simpler.
   - Third-party (e.g. Shinami): managed, with rate limits and allowlists out of the box.

3. **Sponsor key custody**
   - Decide where the sponsor's private key lives. Env var is fine for testnet; production wants KMS or HSM.
   - The sponsor key has full control over its SUI balance. Treat it like a hot wallet.

4. **Allowlist and limits**
   - Define which package ids and entry functions can be sponsored. A sponsor that signs anything is a free gas faucet for attackers.
   - Define per-user and global rate limits.

5. **Dual-signature flow**
   - Client builds the tx, fills in `gasData` placeholders.
   - Server inspects the tx (allowlist + limits), fills in `gasData` (sponsor's coin, gas budget, sponsor address), signs.
   - Client signs the `senderSig`.
   - Either party submits with both signatures.

6. **Demo settlement**
   - Run a real sponsored tx on testnet. Verify both `sponsor` and `sender` are present in the on-chain tx with their addresses.

7. **Top-up automation**
   - Sponsor's SUI balance depletes. Add a monitoring path that alerts (or auto-tops-up) below threshold.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did a real sponsored tx settle on testnet, with both sponsor and sender visible in the on-chain record?
- Is there an explicit allowlist of sponsorable package ids and entry functions?
- Is there a rate limit per user (and per IP, where applicable)?
- Is the sponsor key custody documented? Hot wallet, KMS, multisig, or hardware?
- Is there a sponsor-balance monitor with a threshold alert, or an automatic top-up?
- Does the server reject malformed tx requests (wrong recipient, off-allowlist call, oversized gas budget) with a clear error?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/gas-station-flow.md`: End-to-end dual-signature flow with code.
- `references/sponsor-pitfalls.md`: Abuse vectors, rate-limiting patterns, key custody, replay protection.
- `references/sponsor-allowlist.md`: Constructing a tx allowlist that resists obvious bypasses.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK ecosystem context.

## Use in your agent

- Claude Code: `claude "/sponsored-transactions <your message>"`
- Codex: `codex "/sponsored-transactions <your message>"`
- Cursor: paste a chat message that includes a phrase like "sponsor user gas", or load `~/.cursor/rules/sponsored-transactions.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
