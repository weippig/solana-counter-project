use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("Hyrzj8sTaPKFa7SniV1DmRS5znYN4j3PhjmhtAXzF15R");

#[program]
pub mod counter {

    use super::*; // 允許使用父級的function
		
		// 使用 Context type 來傳入數個 account
    pub fn create(ctx: Context<Create>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;
        Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count -=1 ;
        Ok(())
    }
}
// Transaction instructions
#[derive(Accounts)] // 透過 derive 標註型別，獲得一些預設的函式的實作
pub struct Create<'info> {
    #[account(init, payer = user, space = 16 + 16)] // 想要這個 account 32 byte
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// Transaction instructions
#[derive(Accounts)] 
pub struct Decrement<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

// An account that goes inside a transaction instruction
#[account] // An attribute for a data structure representing a Solana account.//繼承 Anchor(De)Serialize function 等特徵
pub struct BaseAccount {
    pub count: u64,
}