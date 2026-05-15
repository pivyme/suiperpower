#!/usr/bin/env bun
/**
 * Reset the demo state.
 *
 * Returns the publisher's outstanding DUSDC back to the vault via the public
 * `return_quote` entry, restoring the vault's clean 1,000 starting balance
 * for the next demo recording. If the publisher has no DUSDC (typical after
 * a fresh deploy), this is a no-op.
 *
 * Usage:
 *   bun run scripts/reset-demo-state.ts
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

type DeployRecord = {
  which: "test" | "real";
  faucetPackageId: string;
  faucetObjectId: string;
  dusdcCoinType: string;
};

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
    throw new Error(`.deploy.json missing at ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as DeployRecord;
}

async function main(): Promise<void> {
  const rpcUrl = process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io";
  const deploy = loadDeploy();
  const keypair = loadKeypair();
  const client = new SuiClient({ url: rpcUrl });
  const publisher = keypair.toSuiAddress();

  process.stdout.write(`publisher: ${publisher}\n`);
  process.stdout.write(`faucet:    ${deploy.faucetObjectId}\n`);

  const coins = await client.getCoins({
    owner: publisher,
    coinType: deploy.dusdcCoinType,
  });
  let total = 0n;
  for (const c of coins.data) total += BigInt(c.balance);

  if (total === 0n || coins.data.length === 0) {
    process.stdout.write("publisher has no DUSDC, nothing to reset\n");
    return;
  }
  process.stdout.write(`returning ${total} base units across ${coins.data.length} coins\n`);

  const tx = new Transaction();
  const [primary, ...rest] = coins.data;
  if (rest.length > 0) {
    tx.mergeCoins(
      tx.object(primary!.coinObjectId),
      rest.map((c) => tx.object(c.coinObjectId)),
    );
  }
  tx.moveCall({
    target: `${deploy.faucetPackageId}::faucet::return_quote`,
    typeArguments: [deploy.dusdcCoinType],
    arguments: [
      tx.object(deploy.faucetObjectId),
      tx.object(primary!.coinObjectId),
      tx.object("0x6"),
    ],
  });
  tx.setGasBudget(150_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`return_quote failed: ${result.effects?.status.error}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  process.stdout.write(`done: ${result.digest}\n`);
}

main().catch((err) => {
  process.stderr.write(
    `reset-demo-state failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
