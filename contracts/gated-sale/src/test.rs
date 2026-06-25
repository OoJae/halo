#![cfg(test)]
extern crate std;

use soroban_sdk::{
    contract, contractimpl, symbol_short, testutils::Address as _, Address, Env, U256,
};

use crate::{Error, GatedSale, GatedSaleClient};

// A controllable mock of the halo-verifier's `is_verified_for`, to test the gate without proofs.
#[contract]
pub struct MockVerifier;

#[contractimpl]
impl MockVerifier {
    pub fn set_verified(env: Env, v: bool) {
        env.storage().instance().set(&symbol_short!("v"), &v);
    }
    pub fn is_verified_for(
        env: Env,
        _who: Address,
        _scope: U256,
        _min_birth_year: U256,
        _require_accredited: U256,
        _banned_country: U256,
    ) -> bool {
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
    let u = |n: u32| U256::from_u32(&env, n);
    sale.initialize(&admin, &verifier_id, &scope, &u(2008), &u(1), &u(643));

    // Not verified -> buy reverts, sale closed.
    mock.set_verified(&false);
    assert!(!sale.is_open(&buyer));
    assert_eq!(sale.try_buy(&buyer, &100), Err(Ok(Error::NotVerified)));

    // Verified -> sale open, buy succeeds.
    mock.set_verified(&true);
    assert!(sale.is_open(&buyer));
    assert_eq!(sale.buy(&buyer, &100), 100);
}
