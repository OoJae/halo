#![cfg(test)]
extern crate std;

use soroban_sdk::{
    contract, contractimpl, symbol_short, testutils::Address as _, Address, Env, U256,
};

use crate::{Error, GatedSale, GatedSaleClient};

// A controllable mock of the halo-verifier's `is_verified`, to test the gate without proofs.
#[contract]
pub struct MockVerifier;

#[contractimpl]
impl MockVerifier {
    pub fn set_verified(env: Env, v: bool) {
        env.storage().instance().set(&symbol_short!("v"), &v);
    }
    pub fn is_verified(env: Env, _who: Address, _scope: U256) -> bool {
        env.storage().instance().get(&symbol_short!("v")).unwrap_or(false)
    }
}

#[test]
fn buy_is_gated_by_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let verifier_id = env.register(MockVerifier {}, ());
    let mock = MockVerifierClient::new(&env, &verifier_id);

    let sale_id = env.register(GatedSale {}, ());
    let sale = GatedSaleClient::new(&env, &sale_id);

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let scope = U256::from_u32(&env, 777);
    sale.initialize(&admin, &verifier_id, &scope);

    // Not verified -> buy reverts, sale closed.
    mock.set_verified(&false);
    assert!(!sale.is_open(&buyer));
    assert_eq!(sale.try_buy(&buyer, &100), Err(Ok(Error::NotVerified)));

    // Verified -> sale open, buy succeeds.
    mock.set_verified(&true);
    assert!(sale.is_open(&buyer));
    assert_eq!(sale.buy(&buyer, &100), 100);
}
