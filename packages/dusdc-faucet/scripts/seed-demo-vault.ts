#!/usr/bin/env bun
/**
 * Seed the demo vault.
 *
 * Mints test DUSDC against the test TreasuryCap and refills the faucet vault
 * back to the 1,000 DUSDC starting balance described in
 * `bigdev/plans/05-DEMO-FLOW.md`. Idempotent: if the vault already has at
 * least the target balance, this is a no-op.
 *
 * Requires `.deploy.json` (from `scripts/deploy.ts --which=test`) so we know
 * which test DUSDC package, TreasuryCap, faucet object, and faucet package
 * to talk to.
 *
 * Usage:
 *   bun run scripts/seed-demo-vault.ts                 # top up to 1,000 DUSDC
 *   bun run scripts/seed-demo-vault.ts --target=2000   # top up to 2,000 DUSDC
 *
 * Env:
 *   PRIVATE_KEY     bech32 sui priv key (suiprivkey1...) of the publisher
 *   SUI_RPC_URL     defaults to https://fullnode.testnet.sui.io
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

const DUSDC_DECIMALS = 6;
const DEFAULT_TARGET_DUSDC = 1_000n;

type DeployRecord = {
  which: "test" | "real";
  faucetPackageId: string;
  faucetObjectId: string;
  dusdcCoinType: string;
  testDusdcPackageId?: string;
  testDusdcTreasuryCapId?: string;
};

type Flags = {
  rpcUrl: string;
  targetDusdc: bigint;
};

function parseFlags(argv: string[]): Flags {
  const out: Flags = {
    rpcUrl: process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io",
    targetDusdc: DEFAULT_TARGET_DUSDC,
  };
  for (const arg of argv) {
    if (arg.startsWith("--target=")) {
      out.targetDusdc = BigInt(arg.slice("--target=".length));
    } else if (arg.startsWith("--rpc=")) {
      out.rpcUrl = arg.slice("--rpc=".length);
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: bun run scripts/seed-demo-vault.ts [--target=1000] [--rpc=<url>]\n",
      );
      process.exit(0);
    } else {
      throw new Error(`unknown flag: ${arg}`);
    }
  }
  return out;
}

function loadKeypair(): Ed25519Keypair {
  const key = process.env.PRIVATE_KEY;
  if (!key) throw new Error("PRIVATE_KEY env var is required");
  const { schema, secretKey } = decodeSuiPrivateKey(key);
  if (schema !== "ED25519") throw new Error(`unsupported key schema: ${schema}`);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

function loadDeploy(): DeployRecord {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = resolve(here, "..", ".deploy.json");
  if (!existsSync(path)) {
    throw new Error(
      `.deploy.json missing at ${path}; run scripts/deploy.ts --which=test first`,
    );
  }
  const record = JSON.parse(readFileSync(path, "utf8")) as DeployRecord;
  if (record.which !== "test") {
    throw new Error(
      `seed-demo-vault only works against a test deployment; .deploy.json is '${record.which}'`,
    );
  }
  if (!record.testDusdcPackageId || !record.testDusdcTreasuryCapId) {
    throw new Error("deploy record missing test-dusdc metadata");
  }
  return record;
}

async function readVaultQuoteBalance(
  client: SuiClient,
  faucetPkg: string,
  faucetId: string,
  quoteType: string,
): Promise<bigint> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${faucetPkg}::faucet::quote_balance`,
    typeArguments: [quoteType],
    arguments: [tx.object(faucetId)],
  });
  const res = await client.devInspectTransactionBlock({
    sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionBlock: tx,
  });
  const ret = res.results?.[0]?.returnValues?.[0]?.[0];
  if (!ret) throw new Error("quote_balance returned no value");
  // u64 little-endian bytes
  const bytes = new Uint8Array(ret);
  let v = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) v = (v << 8n) | BigInt(bytes[i]!);
  return v;
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const deploy = loadDeploy();
  const keypair = loadKeypair();
  const client = new SuiClient({ url: flags.rpcUrl });

  const publisher = keypair.toSuiAddress();
  process.stdout.write(`publisher: ${publisher}\n`);
  process.stdout.write(`faucet:    ${deploy.faucetObjectId}\n`);

  const targetBase = flags.targetDusdc * 10n ** BigInt(DUSDC_DECIMALS);
  const current = await readVaultQuoteBalance(
    client,
    deploy.faucetPackageId,
    deploy.faucetObjectId,
    deploy.dusdcCoinType,
  );
  process.stdout.write(`current vault: ${current} base units\n`);
  process.stdout.write(`target vault:  ${targetBase} base units\n`);

  if (current >= targetBase) {
    process.stdout.write("vault already at or above target, nothing to do\n");
    return;
  }
  const shortfall = targetBase - current;
  process.stdout.write(`minting + refilling ${shortfall} base units\n`);

  const tx = new Transaction();
  const minted = tx.moveCall({
    target: "0x2::coin::mint",
    typeArguments: [deploy.dusdcCoinType],
    arguments: [
      tx.object(deploy.testDusdcTreasuryCapId!),
      tx.pure.u64(shortfall),
    ],
  });
  tx.moveCall({
    target: `${deploy.faucetPackageId}::faucet::refill`,
    typeArguments: [deploy.dusdcCoinType],
    arguments: [tx.object(deploy.faucetObjectId), minted],
  });
  tx.setGasBudget(150_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`refill failed: ${result.effects?.status.error}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  process.stdout.write(`done: ${result.digest}\n`);
}

main().catch((err) => {
  process.stderr.write(
    `seed-demo-vault failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
