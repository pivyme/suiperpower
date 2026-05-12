<!-- One-line summary in the PR title. Use this body for the why and how. -->

## What

Briefly describe the change.

## Why

Link issues, discussions, or context. If this is a skill change, link the authoritative source you grounded it in.

## How to test

- [ ] `pnpm test` passes locally
- [ ] If skills changed: `pnpm package:skills` ran and indexes regenerated
- [ ] If CLI changed: exercised end-to-end with `pnpm dev`
- [ ] If web changed: `pnpm web:dev` smoke-tested

## Checklist

- [ ] No em-dashes, no banned marketing phrases ("leverage", "robust", "powerful", "seamlessly", "AI-powered", "Web3")
- [ ] Sui terms capitalized (Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin)
- [ ] kebab-case for new skill / file / folder / catalog ids
- [ ] No secrets, API keys, or `.env` content committed
- [ ] Telemetry preamble intact on any new skill (`pnpm preamble:check` clean)
