#!/usr/bin/env bun
/**
 * DUSDC Faucet deploy helper.
 *
 * Stages (per bigdev/plans/06-DEPLOY-AND-ADMIN.md):
 *   1. Optionally publish test-dusdc (when --which=test) and mint 100,000 to publisher.
 *   2. Publish the faucet package.
 *   3. Call create_faucet<T> to make the shared Faucet + AdminCap.
 *   4. If test: refill with 1,000 DUSDC. If real: leave empty.
 *   5. Write ids to .deploy.json, print env lines.
 *
 * Usage:
 *   bun run scripts/deploy.ts --which=test
 *   bun run scripts/deploy.ts --which=real --dusdc-type=0x...::dusdc::DUSDC
 *
 * Env:
 *   PRIVATE_KEY     bech32 sui priv key (suiprivkey1...) for the publisher
 *   SUI_RPC_URL     defaults to https://fullnode.testnet.sui.io
 */

import { existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

const REAL_DUSDC_DEFAULT =
  "0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC";

type Which = "test" | "real";

type Flags = {
  which: Which;
  dusdcType?: string;
  rpcUrl: string;
  dryRun: boolean;
};

function parseFlags(argv: string[]): Flags {
  const out: Partial<Flags> = {
    rpcUrl: process.env.SUI_RPC_URL ?? "https://fullnode.testnet.sui.io",
    dryRun: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--which=")) {
      const v = arg.slice("--which=".length);
      if (v !== "test" && v !== "real") {
        throw new Error(`--which must be 'test' or 'real', got '${v}'`);
      }
      out.which = v;
    } else if (arg.startsWith("--dusdc-type=")) {
      out.dusdcType = arg.slice("--dusdc-type=".length);
    } else if (arg.startsWith("--rpc=")) {
      out.rpcUrl = arg.slice("--rpc=".length);
    } else if (arg === "--dry-run" || arg === "--check") {
      out.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`unknown flag: ${arg}`);
    }
  }
  if (!out.which) {
    throw new Error("missing required flag --which=test|real");
  }
  return out as Flags;
}

function printHelp(): void {
  process.stdout.write(
    [
      "Usage:",
      "  bun run scripts/deploy.ts --which=test",
      "  bun run scripts/deploy.ts --which=real --dusdc-type=0x...::dusdc::DUSDC",
      "",
      "Flags:",
      "  --which=test|real    required, picks the rehearsal or live path",
      "  --dusdc-type=<type>  override the DUSDC coin type (real path)",
      "  --rpc=<url>          override SUI_RPC_URL",
      "  --dry-run            validate flags + env, do not publish",
      "",
    ].join("\n"),
  );
}

function loadKeypair(): Ed25519Keypair {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    throw new Error("PRIVATE_KEY env var is required (bech32 suiprivkey1...)");
  }
  const { schema, secretKey } = decodeSuiPrivateKey(key);
  if (schema !== "ED25519") {
    throw new Error(`unsupported key schema: ${schema}, expected ED25519`);
  }
  return Ed25519Keypair.fromSecretKey(secretKey);
}

function suiBuildAndDump(packageDir: string): { modules: string[]; dependencies: string[] } {
  process.stdout.write(`building Move package at ${packageDir}\n`);
  const raw = execFileSync(
    "sui",
    ["move", "build", "--dump-bytecode-as-base64", "--path", packageDir],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  const parsed = JSON.parse(raw) as { modules: string[]; dependencies: string[] };
  return parsed;
}

async function publishPackage(
  client: SuiClient,
  keypair: Ed25519Keypair,
  packageDir: string,
): Promise<{ packageId: string; result: Awaited<ReturnType<SuiClient["signAndExecuteTransaction"]>> }> {
  const { modules, dependencies } = suiBuildAndDump(packageDir);
  const tx = new Transaction();
  const [upgradeCap] = tx.publish({ modules, dependencies });
  tx.transferObjects([upgradeCap], tx.pure.address(keypair.toSuiAddress()));
  tx.setGasBudget(300_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(
      `publish failed: ${result.effects?.status.error ?? "unknown error"}`,
    );
  }
  await client.waitForTransaction({ digest: result.digest });
  const pkg = result.objectChanges?.find((c) => c.type === "published");
  if (!pkg || pkg.type !== "published") {
    throw new Error("published package id not found in object changes");
  }
  process.stdout.write(`  package: ${pkg.packageId}\n`);
  return { packageId: pkg.packageId, result };
}

function findCreated(
  result: Awaited<ReturnType<SuiClient["signAndExecuteTransaction"]>>,
  matcher: (objectType: string) => boolean,
): { objectId: string; objectType: string } {
  const change = result.objectChanges?.find(
    (c) => c.type === "created" && matcher(c.objectType),
  );
  if (!change || change.type !== "created") {
    throw new Error("expected created object not found in tx result");
  }
  return { objectId: change.objectId, objectType: change.objectType };
}

async function mintTestDusdc(
  client: SuiClient,
  keypair: Ed25519Keypair,
  testPkg: string,
  treasuryCapId: string,
  recipient: string,
): Promise<string> {
  const tx = new Transaction();
  const coin = tx.moveCall({
    target: "0x2::coin::mint",
    typeArguments: [`${testPkg}::test_dusdc::TEST_DUSDC`],
    arguments: [tx.object(treasuryCapId), tx.pure.u64(100_000_000_000n)],
  });
  tx.transferObjects([coin], tx.pure.address(recipient));
  tx.setGasBudget(100_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`mint failed: ${result.effects?.status.error}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  const coinChange = findCreated(result, (t) =>
    t.startsWith(`0x2::coin::Coin<${testPkg}::test_dusdc::TEST_DUSDC>`),
  );
  process.stdout.write(`  minted coin: ${coinChange.objectId}\n`);
  return coinChange.objectId;
}

async function createFaucet(
  client: SuiClient,
  keypair: Ed25519Keypair,
  faucetPkg: string,
  quoteCoinType: string,
): Promise<{ faucetId: string; adminCapId: string }> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${faucetPkg}::faucet::create_faucet`,
    typeArguments: [quoteCoinType],
    arguments: [],
  });
  tx.setGasBudget(100_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true, showObjectChanges: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`create_faucet failed: ${result.effects?.status.error}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  const faucet = findCreated(result, (t) =>
    t.startsWith(`${faucetPkg}::faucet::Faucet<`),
  );
  const adminCap = findCreated(result, (t) =>
    t.startsWith(`${faucetPkg}::faucet::AdminCap`),
  );
  process.stdout.write(`  faucet: ${faucet.objectId}\n`);
  process.stdout.write(`  adminCap: ${adminCap.objectId}\n`);
  return { faucetId: faucet.objectId, adminCapId: adminCap.objectId };
}

async function refill(
  client: SuiClient,
  keypair: Ed25519Keypair,
  faucetPkg: string,
  quoteCoinType: string,
  faucetId: string,
  coinId: string,
  splitAmount: bigint,
): Promise<void> {
  const tx = new Transaction();
  const [refillCoin] = tx.splitCoins(tx.object(coinId), [tx.pure.u64(splitAmount)]);
  tx.moveCall({
    target: `${faucetPkg}::faucet::refill`,
    typeArguments: [quoteCoinType],
    arguments: [tx.object(faucetId), refillCoin],
  });
  tx.setGasBudget(100_000_000);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status.status !== "success") {
    throw new Error(`refill failed: ${result.effects?.status.error}`);
  }
  await client.waitForTransaction({ digest: result.digest });
  process.stdout.write(`  refilled: ${result.digest}\n`);
}

type DeployRecord = {
  network: string;
  which: Which;
  publishedAt: string;
  publisher: string;
  faucetPackageId: string;
  faucetObjectId: string;
  adminCapId: string;
  dusdcCoinType: string;
  testDusdcPackageId?: string;
  testDusdcTreasuryCapId?: string;
  testDusdcCoinId?: string;
};

function writeDeployRecord(path: string, record: DeployRecord): void {
  writeFileSync(path, JSON.stringify(record, null, 2) + "\n");
  process.stdout.write(`wrote ${path}\n`);
}

function printEnvLines(record: DeployRecord): void {
  process.stdout.write("\n# Paste these into packages/dusdc-faucet/.env\n");
  process.stdout.write(`FAUCET_PACKAGE_ID=${record.faucetPackageId}\n`);
  process.stdout.write(`FAUCET_OBJECT_ID=${record.faucetObjectId}\n`);
  process.stdout.write(`DUSDC_COIN_TYPE=${record.dusdcCoinType}\n`);
  process.stdout.write("\n# And these into packages/dusdc-faucet/web/.env\n");
  process.stdout.write(`VITE_FAUCET_PACKAGE_ID=${record.faucetPackageId}\n`);
  process.stdout.write(`VITE_FAUCET_OBJECT_ID=${record.faucetObjectId}\n`);
  process.stdout.write(`VITE_DUSDC_COIN_TYPE=${record.dusdcCoinType}\n`);
  process.stdout.write("\n# AdminCap (keep secret, this controls the faucet)\n");
  process.stdout.write(`ADMIN_CAP=${record.adminCapId}\n`);
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "..");
  const faucetDir = resolve(repoRoot, "contracts/faucet");
  const testDusdcDir = resolve(repoRoot, "contracts/test-dusdc");
  const deployJson = resolve(repoRoot, ".deploy.json");

  if (flags.dryRun) {
    process.stdout.write("dry-run: flags OK\n");
    process.stdout.write(`  which: ${flags.which}\n`);
    process.stdout.write(`  rpcUrl: ${flags.rpcUrl}\n`);
    process.stdout.write(`  faucetDir: ${faucetDir}\n`);
    if (flags.which === "test") {
      process.stdout.write(`  testDusdcDir: ${testDusdcDir}\n`);
    } else {
      process.stdout.write(
        `  dusdcType: ${flags.dusdcType ?? REAL_DUSDC_DEFAULT}\n`,
      );
    }
    return;
  }

  if (!existsSync(faucetDir)) {
    throw new Error(`faucet contract dir missing: ${faucetDir}`);
  }
  if (flags.which === "test" && !existsSync(testDusdcDir)) {
    throw new Error(`test-dusdc contract dir missing: ${testDusdcDir}`);
  }

  const keypair = loadKeypair();
  const publisher = keypair.toSuiAddress();
  const client = new SuiClient({ url: flags.rpcUrl });

  process.stdout.write(`publisher: ${publisher}\n`);
  process.stdout.write(`rpc:       ${flags.rpcUrl}\n\n`);

  let testDusdcPkg: string | undefined;
  let treasuryCapId: string | undefined;
  let mintedCoinId: string | undefined;
  let quoteCoinType: string;

  if (flags.which === "test") {
    process.stdout.write("step 1, publish test-dusdc\n");
    const { packageId, result } = await publishPackage(client, keypair, testDusdcDir);
    testDusdcPkg = packageId;

    const cap = findCreated(result, (t) =>
      t.startsWith(`0x2::coin::TreasuryCap<${testDusdcPkg}::test_dusdc::TEST_DUSDC>`),
    );
    treasuryCapId = cap.objectId;
    process.stdout.write(`  treasury: ${treasuryCapId}\n`);

    process.stdout.write("step 2, mint 100,000 test DUSDC to publisher\n");
    mintedCoinId = await mintTestDusdc(
      client,
      keypair,
      testDusdcPkg,
      treasuryCapId,
      publisher,
    );

    quoteCoinType = `${testDusdcPkg}::test_dusdc::TEST_DUSDC`;
  } else {
    quoteCoinType = flags.dusdcType ?? REAL_DUSDC_DEFAULT;
  }

  process.stdout.write("step 3, publish faucet package\n");
  const { packageId: faucetPkg } = await publishPackage(client, keypair, faucetDir);

  process.stdout.write(`step 4, create_faucet<${quoteCoinType}>\n`);
  const { faucetId, adminCapId } = await createFaucet(
    client,
    keypair,
    faucetPkg,
    quoteCoinType,
  );

  if (flags.which === "test" && mintedCoinId) {
    process.stdout.write("step 5, refill vault with 1,000 DUSDC\n");
    await refill(
      client,
      keypair,
      faucetPkg,
      quoteCoinType,
      faucetId,
      mintedCoinId,
      1_000_000_000n, // 1,000 DUSDC at 6 decimals
    );
  }

  const record: DeployRecord = {
    network: flags.rpcUrl.includes("mainnet") ? "mainnet" : "testnet",
    which: flags.which,
    publishedAt: new Date().toISOString(),
    publisher,
    faucetPackageId: faucetPkg,
    faucetObjectId: faucetId,
    adminCapId,
    dusdcCoinType: quoteCoinType,
    testDusdcPackageId: testDusdcPkg,
    testDusdcTreasuryCapId: treasuryCapId,
    testDusdcCoinId: mintedCoinId,
  };

  writeDeployRecord(deployJson, record);
  printEnvLines(record);
}

main().catch((err) => {
  process.stderr.write(`deploy failed: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
