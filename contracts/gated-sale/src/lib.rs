#![no_std]
//! Gated "regulated token sale" demo. `buy` only proceeds if the buyer holds a Halo
//! attestation for the sale scope — checked via a cross-contract call to the
//! halo-verifier's `is_verified(addr, scope)`. Remove the ZK gate and anyone could buy.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, vec, Address, Env, IntoVal,
    Symbol, U256,
};

#[contracttype]
pub enum DataKey {
    Admin,
    Verifier,
    Scope,
    MinBirthYear,
    RequireAccredited,
    BannedCountry,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotVerified = 3,
}

#[contract]
pub struct GatedSale;

#[contractimpl]
impl GatedSale {
    /// One-time init: admin, the halo-verifier address, the sale scope, and the REQUIRED
    /// eligibility policy. The sale gates on `is_verified_for(scope, policy)`, so it stays closed
    /// unless the buyer proved exactly this policy — robust even if the verifier's scope registry
    /// is unset.
    pub fn initialize(
        env: Env,
        admin: Address,
        verifier: Address,
        scope: U256,
        min_birth_year: U256,
        require_accredited: U256,
        banned_country: U256,
    ) -> Result<(), Error> {
        let s = env.storage().instance();
        if s.has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        s.set(&DataKey::Admin, &admin);
        s.set(&DataKey::Verifier, &verifier);
        s.set(&DataKey::Scope, &scope);
        s.set(&DataKey::MinBirthYear, &min_birth_year);
        s.set(&DataKey::RequireAccredited, &require_accredited);
        s.set(&DataKey::BannedCountry, &banned_country);
        s.extend_ttl(100_000, 2_000_000);
        Ok(())
    }

    /// Admin-only: update the verifier contract address.
    pub fn set_verifier(env: Env, verifier: Address) -> Result<(), Error> {
        let s = env.storage().instance();
        let admin: Address = s.get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        s.set(&DataKey::Verifier, &verifier);
        Ok(())
    }

    /// True if `who` is Halo-verified for the sale scope (delegates to the verifier).
    pub fn is_open(env: Env, who: Address) -> bool {
        let s = env.storage().instance();
        let verifier: Address = match s.get(&DataKey::Verifier) {
            Some(v) => v,
            None => return false,
        };
        let scope: U256 = s.get(&DataKey::Scope).unwrap();
        let mby: U256 = s.get(&DataKey::MinBirthYear).unwrap();
        let ra: U256 = s.get(&DataKey::RequireAccredited).unwrap();
        let bc: U256 = s.get(&DataKey::BannedCountry).unwrap();
        env.invoke_contract::<bool>(
            &verifier,
            &Symbol::new(&env, "is_verified_for"),
            vec![
                &env,
                who.into_val(&env),
                scope.into_val(&env),
                mby.into_val(&env),
                ra.into_val(&env),
                bc.into_val(&env),
            ],
        )
    }

    /// The gated action. Reverts unless the buyer is verified for the sale scope.
    pub fn buy(env: Env, buyer: Address, amount: i128) -> Result<i128, Error> {
        buyer.require_auth();
        if !Self::is_open(env.clone(), buyer.clone()) {
            return Err(Error::NotVerified);
        }
        // Mock purchase — emit an event recording the (gated) buy.
        env.events()
            .publish((symbol_short!("sale"), symbol_short!("buy")), (buyer, amount));
        Ok(amount)
    }
}

mod test;
