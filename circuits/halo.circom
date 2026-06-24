pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

// Poseidon Merkle inclusion proof — our own minimal template.
// Convention: pathIndices[i] == 0  => current node is the LEFT  child at level i
//             pathIndices[i] == 1  => current node is the RIGHT child at level i
// The selector-mux uses a single multiplication per level:
//   idx=0 -> (left,right) = (cur, sibling)
//   idx=1 -> (left,right) = (sibling, cur)
template MerkleInclusion(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output root;

    signal cur[depth + 1];
    cur[0] <== leaf;

    component h[depth];
    signal hl[depth];

    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;       // must be boolean

        hl[i] <== (pathElements[i] - cur[i]) * pathIndices[i];

        h[i] = Poseidon(2);
        h[i].inputs[0] <== cur[i] + hl[i];                 // left
        h[i].inputs[1] <== pathElements[i] - hl[i];        // right
        cur[i + 1] <== h[i].out;
    }

    root <== cur[depth];
}

template Halo(depth) {
    // ---- private ----
    signal input birthYear;            // e.g. 2000
    signal input country;              // ISO numeric, e.g. 840 (US)
    signal input accredited;           // 0 or 1
    signal input secret;               // high-entropy identity secret
    signal input pathElements[depth];
    signal input pathIndices[depth];

    // ---- public ----
    signal input root;                 // issuer's registered Merkle root
    signal input scope;                // external nullifier / context id
    signal input minBirthYear;         // age gate: birthYear <= minBirthYear
    signal input requireAccredited;    // 0 or 1
    signal input bannedCountry;        // region predicate: country != bannedCountry
    signal input addr;                 // caller's Stellar address as a field element

    // ---- public output ----
    signal output nullifier;

    // 1) leaf = Poseidon(birthYear, country, accredited, secret)
    component leafH = Poseidon(4);
    leafH.inputs[0] <== birthYear;
    leafH.inputs[1] <== country;
    leafH.inputs[2] <== accredited;
    leafH.inputs[3] <== secret;

    // 2) Merkle membership: leaf is under `root` via (pathElements, pathIndices)
    component incl = MerkleInclusion(depth);
    incl.leaf <== leafH.out;
    for (var i = 0; i < depth; i++) {
        incl.pathElements[i] <== pathElements[i];
        incl.pathIndices[i] <== pathIndices[i];
    }
    incl.root === root;

    // 3) age: birthYear <= minBirthYear  (born no later than the cutoff => old enough)
    component ageOk = LessEqThan(16);
    ageOk.in[0] <== birthYear;
    ageOk.in[1] <== minBirthYear;
    ageOk.out === 1;

    // 4) accreditation: accredited >= requireAccredited
    component accOk = GreaterEqThan(8);
    accOk.in[0] <== accredited;
    accOk.in[1] <== requireAccredited;
    accOk.out === 1;

    // 5) region: country != bannedCountry
    component banEq = IsEqual();
    banEq.in[0] <== country;
    banEq.in[1] <== bannedCountry;
    banEq.out === 0;

    // 6) nullifier = Poseidon(secret, scope)  (same person+scope => same nullifier)
    component nh = Poseidon(2);
    nh.inputs[0] <== secret;
    nh.inputs[1] <== scope;
    nullifier <== nh.out;

    // 7) bind caller address into the proof (anti-replay): keep `addr` constrained
    signal addrSq;
    addrSq <== addr * addr;
}

component main { public [root, scope, minBirthYear, requireAccredited, bannedCountry, addr] } = Halo(16);
