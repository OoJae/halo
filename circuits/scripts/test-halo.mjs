// Day-2 gate test harness.
// Asserts, end-to-end (snarkjs witness + Groth16 prove + verify), that:
//   - a valid accredited adult holder verifies
//   - under-18, wrong-country, and non-accredited inputs each FAIL
// Predicate violations make witness generation throw (the circuit asserts), which
// is the intended "fails" behavior — we assert the throw.
import * as snarkjs from "snarkjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const circuits = path.join(__dirname, "..");
const build = path.join(circuits, "build");
const issuerOut = path.join(circuits, "..", "issuer", "out");

const WASM = path.join(build, "halo_js", "halo.wasm");
const ZKEY = path.join(build, "halo_final.zkey");
const VK = JSON.parse(fs.readFileSync(path.join(build, "verification_key.json"), "utf8"));
const load = (name) => JSON.parse(fs.readFileSync(path.join(issuerOut, `${name}.json`), "utf8"));

const SCOPE = "12345"; // external nullifier / context id, fixed across cases

function buildInput(holder, gate) {
  return {
    birthYear: holder.birthYear,
    country: holder.country,
    accredited: holder.accredited,
    secret: holder.secret,
    pathElements: holder.pathElements,
    pathIndices: holder.pathIndices,
    root: holder.root,
    scope: SCOPE,
    minBirthYear: gate.minBirthYear,
    requireAccredited: gate.requireAccredited,
    bannedCountry: gate.bannedCountry,
    addr: holder.addr,
  };
}

async function prove(input) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM, ZKEY);
  const ok = await snarkjs.groth16.verify(VK, publicSignals, proof);
  return { ok, publicSignals };
}

const A = load("holderA"); // accredited adult, US
const B = load("holderB"); // non-accredited

let allPass = true;
function check(name, cond) {
  allPass = allPass && cond;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
}

// A gate that holderA satisfies: 18+ (born <= 2008), accredited, not in banned country.
const VALID_GATE = { minBirthYear: "2008", requireAccredited: "1", bannedCountry: "643" };

// 1) valid -> verifies
try {
  const { ok, publicSignals } = await prove(buildInput(A, VALID_GATE));
  check("valid holderA proof verifies", ok === true);
  console.log("      nullifier (public[0]):", publicSignals[0]);
  console.log("      root      (public[1]):", publicSignals[1]);
} catch (e) {
  check("valid holderA proof verifies", false);
  console.log("      unexpected error:", e.message.split("\n")[0]);
}

// 2) under-18 -> fails (born 2000, gate demands born <= 1990)
try {
  await prove(buildInput(A, { ...VALID_GATE, minBirthYear: "1990" }));
  check("under-18 input is rejected", false);
} catch {
  check("under-18 input is rejected", true);
}

// 3) wrong-country -> fails (holder country 840 == bannedCountry)
try {
  await prove(buildInput(A, { ...VALID_GATE, bannedCountry: "840" }));
  check("wrong-country input is rejected", false);
} catch {
  check("wrong-country input is rejected", true);
}

// 4) non-accredited -> fails (holderB accredited=0, gate requires 1)
try {
  await prove(buildInput(B, VALID_GATE));
  check("non-accredited input is rejected", false);
} catch {
  check("non-accredited input is rejected", true);
}

console.log(allPass ? "\n✅ ALL DAY-2 GATES PASS" : "\n❌ SOME GATES FAILED");
process.exit(allPass ? 0 : 1);
