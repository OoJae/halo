// Wallet/demo signing + typed contract clients (generated bindings).
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { Keypair } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Client as VerifierClient } from "../bindings/halo-verifier/src";
import { Client as SaleClient } from "../bindings/gated-sale/src";
import type { Proof } from "../bindings/halo-verifier/src";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const PASSPHRASE = Networks.TESTNET;
export const VERIFIER_ID = "CBXEUMNLBWQEGQDEVFTFD5ZCBZYWVJ2WAW2LLOIVF3Z7YCMPKG2ZNYY6";
export const SALE_ID = "CAZXMBOBMI2YY5IRR5VVELUFHNK6NBGQEA2Z4L7LOZXIZLO23H7QBXA2";
export const SALE_SCOPE = "424242";
export const EXPLORER_TX = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;
export const EXPLORER_CONTRACT = (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`;

interface Signer {
  address: string;
  signTransaction: any;
  signAuthEntry?: any;
}
let active: Signer | null = null;

export const hasDemo = () => !!import.meta.env.VITE_DEMO_SECRET;
export const activeAddress = () => active?.address ?? "";

let kit: StellarWalletsKit | null = null;
function getKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule()],
    });
  }
  return kit;
}

export async function connectWallet(): Promise<string> {
  const k = getKit();
  return new Promise((resolve, reject) => {
    k.openModal({
      onWalletSelected: async (option) => {
        try {
          k.setWallet(option.id);
          const { address } = await k.getAddress();
          active = {
            address,
            signTransaction: async (xdr: string) => {
              const { signedTxXdr } = await k.signTransaction(xdr, { address, networkPassphrase: PASSPHRASE });
              return { signedTxXdr, signerAddress: address };
            },
            signAuthEntry: async (authXdr: string) => {
              const { signedAuthEntry } = await k.signAuthEntry(authXdr, { address, networkPassphrase: PASSPHRASE });
              return { signedAuthEntry, signerAddress: address };
            },
          };
          resolve(address);
        } catch (e) {
          reject(e);
        }
      },
      onClosed: () => reject(new Error("Wallet selection cancelled")),
    });
  });
}

// Demo fallback: sign with a funded testnet keypair (testnet-only; for reliable demos).
export function connectDemo(): string {
  const secret = import.meta.env.VITE_DEMO_SECRET as string | undefined;
  if (!secret) throw new Error("demo wallet not configured");
  const kp = Keypair.fromSecret(secret);
  const s = basicNodeSigner(kp, PASSPHRASE);
  active = { address: kp.publicKey(), signTransaction: s.signTransaction, signAuthEntry: s.signAuthEntry };
  return active.address;
}

function withSigner() {
  if (!active) throw new Error("Connect a wallet first");
  return { publicKey: active.address, signTransaction: active.signTransaction, signAuthEntry: active.signAuthEntry };
}

function verifierClient(signed = false) {
  return new VerifierClient({ contractId: VERIFIER_ID, networkPassphrase: PASSPHRASE, rpcUrl: RPC_URL, ...(signed ? withSigner() : {}) });
}
function saleClient(signed = false) {
  return new SaleClient({ contractId: SALE_ID, networkPassphrase: PASSPHRASE, rpcUrl: RPC_URL, ...(signed ? withSigner() : {}) });
}

const hashOf = (sent: any): string =>
  sent?.sendTransactionResponse?.hash ?? sent?.getTransactionResponse?.txHash ?? sent?.result?.hash ?? "";

export async function submitVerify(proof: Proof, publicSignals: bigint[]): Promise<{ hash: string }> {
  const tx = await verifierClient(true).verify({ caller: active!.address, proof, public_signals: publicSignals });
  const sent = await tx.signAndSend();
  return { hash: hashOf(sent) };
}

export async function isVerified(scope: string): Promise<boolean> {
  const tx = await verifierClient().is_verified({ who: active!.address, scope: BigInt(scope) });
  return tx.result as boolean;
}

export async function attestedAt(scope: string): Promise<number | undefined> {
  const tx = await verifierClient().attested_at({ who: active!.address, scope: BigInt(scope) });
  return tx.result as number | undefined;
}

export async function saleIsOpen(): Promise<boolean> {
  const tx = await saleClient().is_open({ who: active!.address });
  return tx.result as boolean;
}

export async function buy(amount: bigint): Promise<{ hash: string }> {
  const tx = await saleClient(true).buy({ buyer: active!.address, amount });
  const sent = await tx.signAndSend();
  return { hash: hashOf(sent) };
}
