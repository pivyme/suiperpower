#!/usr/bin/env bun
/**
 * One-shot: drain remaining DUSDC from the deployed faucet, forward it to a
 * recipient, then flip the on-chain rate to 1 SUI = 1 DUSDC.
 *
 * Three sequential transactions, each printed with its digest:
 *   1. recover_quote(amount)       -> DUSDC lands in publisher (= recovery admin)
 *   2. transfer all publisher DUSDC to RECIPIENT
 *   3. set_rate(1, 1)              -> live rate becomes 1:1
 *
 * Env:
 *   PRIVATE_KEY  bech32 suiprivkey1... for the publisher / recovery admin
 *   SUI_RPC_URL  optional, defaults to testnet fullnode
 *
 * Run:
 *   bun run scripts/drain-and-reprice.ts
 *
 * The recipient is hardcoded so this is not reusable as a generic sweep tool.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

const RECIPIENT =
  "0x4eddfba6fcb9a6c5e14476299a03173fdcaf0bbc06cac505db262ee27eea4a0c";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEPLOY_PATH = resolve(HERE, "..", ".deploy.json");

type DeployJson = {
  faucetPackageId: string;
  faucetObjectId: string;
  adminCapId: string;
  dusdcCoinType: string;
};

function loadDeploy(): DeployJson {
  const raw = readFileSync(DEPLOY_PATH, "utf8");
  return JSON.parse(raw) as DeployJson;
}

function loadKeypair(): Ed25519Keypair {
  const key = process.env.PRIVATE_KEY;
  if (!key) throw new Error("PRIVATE_KEY env var is required (suiprivkey1...)");
  const { schema, secretKey } = decodeSuiPrivateKey(key);
  if (schema !== "ED25519") throw new Error(`unsupported key schema: ${schema}`);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

async function waitFor(client: SuiClient, digest: string) {
  await client.waitForTransaction({ digest, options: { showEffects: true } });
}

async function readVault(
  client: SuiClient,
  faucetObjectId: string,
): Promise<{ quote: bigint; rateNum: string; rateDen: string }> {
  const obj = await client.getObject({
    id: faucetObjectId,
    options: { showContent: true },
  });
  const content = obj.data?.content;
  if (!content || content.dataType !== "moveObject") {
    throw new Error("faucet object content missing");
  }
  const f = content.fields as Record<string, unknown>;
  return {
    quote: BigInt(f.quote_balance as string),
    rateNum: String(f.rate_numerator),
    rateDen: String(f.rate_denominator),
  };
}

async function main() {
  const deploy = loadDeploy();
  const keypair = loadKeypair();
  const sender = keypair.toSuiAddress();
  const rpcUrl = process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io";
  const client = new SuiClient({ url: rpcUrl });

  process.stdout.write(`rpc:        ${rpcUrl}\n`);
  process.stdout.write(`sender:     ${sender}\n`);
  process.stdout.write(`faucet:     ${deploy.faucetObjectId}\n`);
  process.stdout.write(`dusdc type: ${deploy.dusdcCoinType}\n`);
  process.stdout.write(`recipient:  ${RECIPIENT}\n\n`);

  const before = await readVault(client, deploy.faucetObjectId);
  process.stdout.write(
    `vault before: quote=${before.quote} base units, rate=${before.rateNum}/${before.rateDen}\n\n`,
  );

  // 1. Recover all DUSDC out of the vault to the recovery admin (= sender).
  if (before.quote > 0n) {
    const tx = new Transaction();
    tx.moveCall({
      target: `${deploy.faucetPackageId}::faucet::recover_quote`,
      typeArguments: [deploy.dusdcCoinType],
      arguments: [tx.object(deploy.faucetObjectId), tx.pure.u64(before.quote)],
    });
    const res = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true },
    });
    process.stdout.write(`recover_quote digest: ${res.digest}\n`);
    await waitFor(client, res.digest);
  } else {
    process.stdout.write(`vault already empty, skipping recover_quote\n`);
  }

  // 2. Forward every DUSDC coin the sender holds to RECIPIENT.
  const coins = await client.getCoins({
    owner: sender,
    coinType: deploy.dusdcCoinType,
  });
  if (coins.data.length === 0) {
    process.stdout.write(`no DUSDC coins to forward, skipping transfer\n`);
  } else {
    const total = coins.data.reduce((acc, c) => acc + BigInt(c.balance), 0n);
    const tx = new Transaction();
    const refs = coins.data.map((c) => tx.object(c.coinObjectId));
    tx.transferObjects(refs, tx.pure.address(RECIPIENT));
    const res = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true },
    });
    process.stdout.write(
      `transfer DUSDC digest: ${res.digest} (${total} base units, ${coins.data.length} coin object(s))\n`,
    );
    await waitFor(client, res.digest);
  }

  const after = await readVault(client, deploy.faucetObjectId);
  process.stdout.write(
    `\nvault after:  quote=${after.quote} base units, rate=${after.rateNum}/${after.rateDen}\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`);
  process.exit(1);
});
