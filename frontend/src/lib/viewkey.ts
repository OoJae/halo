// Auditor view-key escrow (demo tier). Encrypt one attribute to the auditor's public
// key with NaCl box; only the auditor's secret key can decrypt. NOTE: in this demo the
// ciphertext is NOT yet bound in-circuit to the proven attribute — it demonstrates the
// selective-disclosure direction.
import nacl from "tweetnacl";
import util from "tweetnacl-util";

// Demo auditor keypair. In reality only the auditor holds AUDITOR_SECRET; we include it
// here only so the "Auditor view" tab can demonstrate decryption on the same machine.
export const AUDITOR_PUBLIC = "TXzVO10NkWKJEtgwbzkJoAU0bK9Dlk5rWo/cxwKL4HQ=";
export const AUDITOR_SECRET = "1P3qMjX+5x7xmE0QFd4QgfRGxZO3gm08bIrEspGjKoU=";

export interface Sealed {
  box: string;
  nonce: string;
  ephPub: string;
}

export function encryptToAuditor(message: string): Sealed {
  const eph = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const ct = nacl.box(
    util.decodeUTF8(message),
    nonce,
    util.decodeBase64(AUDITOR_PUBLIC),
    eph.secretKey,
  );
  return {
    box: util.encodeBase64(ct),
    nonce: util.encodeBase64(nonce),
    ephPub: util.encodeBase64(eph.publicKey),
  };
}

export function auditorDecrypt(sealed: Sealed, auditorSecretB64: string): string | null {
  const msg = nacl.box.open(
    util.decodeBase64(sealed.box),
    util.decodeBase64(sealed.nonce),
    util.decodeBase64(sealed.ephPub),
    util.decodeBase64(auditorSecretB64),
  );
  return msg ? util.encodeUTF8(msg) : null;
}
