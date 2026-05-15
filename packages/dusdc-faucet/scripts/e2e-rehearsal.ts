#!/usr/bin/env bun
/**
 * End-to-end rehearsal against testnet.
 *
 * Exercises the golden demo path on an already-deployed faucet:
 *   1. read vault stats before
 *   2. claim 0.5 SUI worth of DUSDC
 *   3. assert wallet DUSDC went up by 50 and vault SUI went up by 0.5
 *   4. return 50 DUSDC
 *   5. assert wallet SUI went up by ~0.5 (minus gas) and vault DUSDC went up by 50
 *   6. mint 500 fresh DUSDC via the test TreasuryCap
 *   7. refill 500 DUSDC
 *   8. assert vault DUSDC went up by 500
 *   9. read vault stats after and print a PASS/FAIL summary
 *
 * Reads `.deploy.json` for object ids. Reads PRIVATE_KEY (or
 * E2E_SIGNER_PRIVATE_KEY) from env. Every tx digest is printed with a
 * suiscan link. Exit code 0 on PASS, 1 on any failure.
 *
 * Usage:
 *   bun run scripts/e2e-rehearsal.ts
 *   bun run scripts/e2e-rehearsal.ts --rpc=https://fullnode.testnet.sui.io
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

const SUI_DECIMALS = 9;
const DUSDC_DECIMALS = 6;
const CLAIM_SUI = 500_000_000n; // 0.5 SUI in MIST
const EXPECTED_DUSDC_OUT = 50_000_000n; // 50 DUSDC at 6 decimals
const RETURN_DUSDC = 50_000_000n;
const REFILL_DUSDC = 500_000_000n; // 500 DUSDC

type DeployRecord = {
  which: "test" | "real";
  faucetPackageId: string;
  faucetObjectId: string;
  dusdcCoinType: string;
  testDusdcPackageId?: string;
  testDusdcTreasuryCapId?: string;
};

type Flags = { rpcUrl: string };

function parseFlags(argv: string[]): Flags {
  const out: Flags = {
    rpcUrl: process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io",
  };
  for (const arg of argv) {
    if (arg.startsWith("--rpc=")) {
      out.rpcUrl = arg.slice("--rpc=".length);
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write("Usage: bun run scripts/e2e-rehearsal.ts [--rpc=<url>]\n");
      process.exit(0);
    } else {
      throw new Error(`unknown flag: ${arg}`);
    }
  }
  return out;
}

function loadKeypair(): Ed25519Keypair {
  const key = process.env.PRIVATE_KEY ?? process.env.E2E_SIGNER_PRIVATE_KEY;
  if (!key) {
    throw new Error("PRIVATE_KEY (or E2E_SIGNER_PRIVATE_KEY) env var is required");
  }
  const { schema, secretKey } = decodeSuiPrivateKey(key);
  if (schema !== "ED25519") throw new Error(`unsupported key schema: ${schema}`);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

function loadDeploy(): DeployRecord {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = resolve(here, "..", ".deploy.json");
  if (!existsSync(path)) {
    throw new Error(`.deploy.json missing at ${path}; run scripts/deploy.ts first`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as DeployRecord;
}

function explorerLink(digest: string): string {
  return `https://suiscan.xyz/testnet/tx/${digest}`;
}

function decodeU64LE(bytes: number[] | Uint8Array): bigint {
  const arr = Array.isArray(bytes) ? bytes : Array.from(bytes);
  let v = 0n;
  for (let i = arr.length - 1; i >= 0; i--) v = (v << 8n) | BigInt(arr[i]!);
  return v;
}

async function readFaucetView(
  client: SuiClient,
  faucetPkg: string,
  faucetId: string,
  quoteType: string,
  fn: "quote_balance" | "sui_balance" | "total_served_quote" | "total_claims",
): Promise<bigint> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${faucetPkg}::faucet::${fn}`,
    typeArguments: [quoteType],
    arguments: [tx.object(faucetId)],
  });
  const res = await client.devInspectTransactionBlock({
    sender: "0x0000000000000000000000000000000000000000000000000000000000000000",
    transactionBlock: tx,
  });
  const ret = res.results?.[0]?.returnValues?.[0]?.[0];
  if (!ret) throw new Error(`${fn} returned no value`);
  return decodeU64LE(ret);
}

type VaultStats = {
  quoteBalance: bigint;
  suiBalance: bigint;
  totalServedQuote: bigint;
  totalClaims: bigint;
};

async function readVaultStats(
  client: SuiClient,
  faucetPkg: string,
  faucetId: string,
  quoteType: string,
): Promise<VaultStats> {
  const [quoteBalance, suiBalance, totalServedQuote, totalClaims] = await Promise.all([
    readFaucetView(client, faucetPkg, faucetId, quoteType, "quote_balance"),
    readFaucetView(client, faucetPkg, faucetId, quoteType, "sui_balance"),
    readFaucetView(client, faucetPkg, faucetId, quoteType, "total_served_quote"),
    readFaucetView(client, faucetPkg, faucetId, quoteType, "total_claims"),
  ]);
  return { quoteBalance, suiBalance, totalServedQuote, totalClaims };
}

async function walletDusdcBalance(
  client: SuiClient,
  owner: string,
  coinType: string,
): Promise<bigint> {
  const balance = await client.getBalance({ owner, coinType });
  return BigInt(balance.totalBalance);
}

async function walletSuiBalance(client: SuiClient, owner: string): Promise<bigint> {
  const balance = await client.getBalance({ owner });
  return BigInt(balance.totalBalance);
}

function formatSui(mist: bigint): string {
  const s = mist.toString().padStart(SUI_DECIMALS + 1, "0");
  return `${s.slice(0, -SUI_DECIMALS)}.${s.slice(-SUI_DECIMALS)}`;
}

function formatDusdc(base: bigint): string {
  const s = base.toString().padStart(DUSDC_DECIMALS + 1, "0");
  return `${s.slice(0, -DUSDC_DECIMALS)}.${s.slice(-DUSDC_DECIMALS)}`;
}

type AssertionResult = { name: string; pass: boolean; detail: string };

function assertEq(
  results: AssertionResult[],
  name: string,
  expected: bigint,
  actual: bigint,
): void {
  const pass = expected === actual;
  results.push({
    name,
    pass,
    detail: pass
      ? `ok (${actual})`
      : `expected ${expected}, got ${actual} (diff ${actual - expected})`,
  });
}

function assertApprox(
  results: AssertionResult[],
  name: string,
  expected: bigint,
  actual: bigint,
  tolerance: bigint,
): void {
  const diff = actual > expected ? actual - expected : expected - actual;
  const pass = diff <= tolerance;
  results.push({
    name,
    pass,
    detail: pass
      ? `ok (${actual}, within ${tolerance})`
      : `expected ~${expected} +-${tolerance}, got ${actual} (diff ${diff})`,
  });
}

async function execAndWait(
  client: SuiClient,
  keypair: Ed25519Keypair,
  tx: Transaction,
  label: string,
): Promise<string> {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`${label} failed: ${result.effects?.status.error ?? "unknown"}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  process.stdout.write(`  ${label}: ${result.digest}\n  ${explorerLink(result.digest)}\n`);
  return result.digest;
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const deploy = loadDeploy();
  const keypair = loadKeypair();
  const client = new SuiClient({ url: flags.rpcUrl });
  const me = keypair.toSuiAddress();

  process.stdout.write(`signer:  ${me}\n`);
  process.stdout.write(`faucet:  ${deploy.faucetObjectId}\n`);
  process.stdout.write(`package: ${deploy.faucetPackageId}\n`);
  process.stdout.write(`coin:    ${deploy.dusdcCoinType}\n\n`);

  const results: AssertionResult[] = [];

  // Step 1: snapshot before
  process.stdout.write("[1/9] reading vault stats before\n");
  const before = await readVaultStats(
    client,
    deploy.faucetPackageId,
    deploy.faucetObjectId,
    deploy.dusdcCoinType,
  );
  const walletDusdcBefore = await walletDusdcBalance(client, me, deploy.dusdcCoinType);
  const walletSuiBefore = await walletSuiBalance(client, me);
  process.stdout.write(
    `  vault: ${formatDusdc(before.quoteBalance)} DUSDC, ${formatSui(before.suiBalance)} SUI, claims=${before.totalClaims}\n`,
  );
  process.stdout.write(
    `  wallet: ${formatDusdc(walletDusdcBefore)} DUSDC, ${formatSui(walletSuiBefore)} SUI\n\n`,
  );

  // Step 2: claim 0.5 SUI worth of DUSDC
  process.stdout.write("[2/9] claim 0.5 SUI -> 50 DUSDC\n");
  {
    const tx = new Transaction();
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(CLAIM_SUI)]);
    tx.moveCall({
      target: `${deploy.faucetPackageId}::faucet::claim`,
      typeArguments: [deploy.dusdcCoinType],
      arguments: [tx.object(deploy.faucetObjectId), paymentCoin, tx.object("0x6")],
    });
    tx.setGasBudget(150_000_000);
    await execAndWait(client, keypair, tx, "claim");
  }

  // Step 3: assert claim deltas
  process.stdout.write("[3/9] verifying claim deltas\n");
  const afterClaim = await readVaultStats(
    client,
    deploy.faucetPackageId,
    deploy.faucetObjectId,
    deploy.dusdcCoinType,
  );
  const walletDusdcAfterClaim = await walletDusdcBalance(client, me, deploy.dusdcCoinType);
  assertEq(
    results,
    "wallet DUSDC +50",
    walletDusdcBefore + EXPECTED_DUSDC_OUT,
    walletDusdcAfterClaim,
  );
  assertEq(
    results,
    "vault SUI +0.5",
    before.suiBalance + CLAIM_SUI,
    afterClaim.suiBalance,
  );
  assertEq(
    results,
    "vault DUSDC -50",
    before.quoteBalance - EXPECTED_DUSDC_OUT,
    afterClaim.quoteBalance,
  );
  assertEq(
    results,
    "total_claims +1",
    before.totalClaims + 1n,
    afterClaim.totalClaims,
  );
  process.stdout.write("\n");

  // Step 4: return 50 DUSDC
  process.stdout.write("[4/9] return 50 DUSDC -> 0.5 SUI\n");
  const walletSuiBeforeReturn = await walletSuiBalance(client, me);
  {
    const coins = await client.getCoins({ owner: me, coinType: deploy.dusdcCoinType });
    if (coins.data.length === 0) throw new Error("no DUSDC coins to return");
    const tx = new Transaction();
    const primary = coins.data[0]!;
    if (coins.data.length > 1) {
      tx.mergeCoins(
        tx.object(primary.coinObjectId),
        coins.data.slice(1).map((c) => tx.object(c.coinObjectId)),
      );
    }
    const [returnCoin] = tx.splitCoins(tx.object(primary.coinObjectId), [
      tx.pure.u64(RETURN_DUSDC),
    ]);
    tx.moveCall({
      target: `${deploy.faucetPackageId}::faucet::return_quote`,
      typeArguments: [deploy.dusdcCoinType],
      arguments: [tx.object(deploy.faucetObjectId), returnCoin, tx.object("0x6")],
    });
    tx.setGasBudget(150_000_000);
    await execAndWait(client, keypair, tx, "return");
  }

  // Step 5: assert return deltas
  process.stdout.write("[5/9] verifying return deltas\n");
  const afterReturn = await readVaultStats(
    client,
    deploy.faucetPackageId,
    deploy.faucetObjectId,
    deploy.dusdcCoinType,
  );
  const walletDusdcAfterReturn = await walletDusdcBalance(client, me, deploy.dusdcCoinType);
  const walletSuiAfterReturn = await walletSuiBalance(client, me);
  // Gas tolerance: a single PTB on testnet costs well under 0.05 SUI. 50M MIST = 0.05 SUI.
  const GAS_TOLERANCE = 50_000_000n;
  assertEq(
    results,
    "wallet DUSDC -50 after return",
    walletDusdcAfterClaim - RETURN_DUSDC,
    walletDusdcAfterReturn,
  );
  assertApprox(
    results,
    "wallet SUI ~+0.5 after return",
    walletSuiBeforeReturn + CLAIM_SUI,
    walletSuiAfterReturn,
    GAS_TOLERANCE,
  );
  assertEq(
    results,
    "vault DUSDC +50 after return",
    afterClaim.quoteBalance + RETURN_DUSDC,
    afterReturn.quoteBalance,
  );
  assertEq(
    results,
    "vault SUI -0.5 after return",
    afterClaim.suiBalance - CLAIM_SUI,
    afterReturn.suiBalance,
  );
  process.stdout.write("\n");

  // Step 6 + 7: mint 500 DUSDC via TreasuryCap and refill in one PTB
  process.stdout.write("[6/9] mint 500 DUSDC via TreasuryCap, then refill\n");
  if (deploy.which !== "test" || !deploy.testDusdcTreasuryCapId) {
    throw new Error(
      "rehearsal currently requires a 'test' deployment with a TreasuryCap on file",
    );
  }
  {
    const tx = new Transaction();
    const minted = tx.moveCall({
      target: "0x2::coin::mint",
      typeArguments: [deploy.dusdcCoinType],
      arguments: [
        tx.object(deploy.testDusdcTreasuryCapId),
        tx.pure.u64(REFILL_DUSDC),
      ],
    });
    tx.moveCall({
      target: `${deploy.faucetPackageId}::faucet::refill`,
      typeArguments: [deploy.dusdcCoinType],
      arguments: [tx.object(deploy.faucetObjectId), minted],
    });
    tx.setGasBudget(200_000_000);
    await execAndWait(client, keypair, tx, "mint+refill");
  }

  // Step 8: assert refill delta
  process.stdout.write("[7/9] verifying refill delta\n");
  const afterRefill = await readVaultStats(
    client,
    deploy.faucetPackageId,
    deploy.faucetObjectId,
    deploy.dusdcCoinType,
  );
  assertEq(
    results,
    "vault DUSDC +500 after refill",
    afterReturn.quoteBalance + REFILL_DUSDC,
    afterRefill.quoteBalance,
  );
  process.stdout.write("\n");

  // Step 9: final snapshot + report
  process.stdout.write("[8/9] reading vault stats after\n");
  process.stdout.write(
    `  vault: ${formatDusdc(afterRefill.quoteBalance)} DUSDC, ${formatSui(afterRefill.suiBalance)} SUI, claims=${afterRefill.totalClaims}\n\n`,
  );

  process.stdout.write("[9/9] summary\n");
  let failed = 0;
  for (const r of results) {
    const tag = r.pass ? "PASS" : "FAIL";
    process.stdout.write(`  [${tag}] ${r.name}, ${r.detail}\n`);
    if (!r.pass) failed += 1;
  }
  process.stdout.write(`\n${failed === 0 ? "PASS" : "FAIL"} ${results.length - failed}/${results.length} assertions\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(
    `e2e-rehearsal failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
