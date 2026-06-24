pragma circom 2.1.6;

// Trivial Day-1 de-risk circuit: prove knowledge of a, b such that a*b == c.
// a, b are private; c is the single public output (exercises G1, G2, Fr and IC folding
// in the Groth16 verifier without any Poseidon/Merkle machinery yet).
template Mul() {
    signal input a;
    signal input b;
    signal output c;
    c <== a * b;
}

component main = Mul();
