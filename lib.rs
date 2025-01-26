use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("5An7W1oQjTpUW3tq3kgiH2v5MXMKogz97yMYnmqc9Edq");

// Constants
const MINIMUM_FUD_TOKENS: u64 = 100_000;  // Minimum FUD tokens needed in wallet
const PAID_ENTRY_COST: u64 = 500;         // Cost in FUD tokens for paid entry
const FREE_ENTRY_COOLDOWN: i64 = 21600;   // 6 hours cooldown for free entries
const MAX_ENTRIES_PER_QUERY: u64 = 100;   // Maximum entries per leaderboard query
const MAX_RESET_HISTORY: usize = 10;  // Keep last 10 resets
const NONCE_EXPIRY: i64 = 300;        // Nonce expires after 5 minutes

#[program]
pub mod game_leaderboard {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        leaderboard.authority = ctx.accounts.authority.key();
        leaderboard.paid_entries_count = 0;
        leaderboard.free_entries_count = 0;
        leaderboard.accumulated_fud = 0;
        leaderboard.is_locked = false;
        leaderboard.reset_history = Vec::with_capacity(MAX_RESET_HISTORY);
        leaderboard.used_nonces = Vec::with_capacity(100); // Store last 100 nonces
        Ok(())
    }

    pub fn submit_paid_score(ctx: Context<SubmitPaidScore>, score: u64, nonce: u64) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        require!(!leaderboard.is_locked, LeaderboardError::LeaderboardLocked);
        require!(score > 0, LeaderboardError::InvalidScore);

        // Check and clean expired nonces
        let now = Clock::get()?.unix_timestamp;
        leaderboard.used_nonces.retain(|n| now - n.timestamp < NONCE_EXPIRY);
        
        // Verify nonce hasn't been used
        require!(
            !leaderboard.used_nonces.iter().any(|n| n.nonce == nonce),
            LeaderboardError::NonceAlreadyUsed
        );

        // Add nonce to used list
        leaderboard.used_nonces.push(NonceRecord {
            nonce,
            timestamp: now,
        });

        let entry = &mut ctx.accounts.score_entry;
        
        // Verify FUD balance
        require!(
            ctx.accounts.player_token_account.amount >= MINIMUM_FUD_TOKENS,
            LeaderboardError::InsufficientBalance
        );

        // Transfer FUD tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.player.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, PAID_ENTRY_COST)?;

        // Create score entry
        entry.player = ctx.accounts.player.key();
        entry.score = score;
        entry.timestamp = Clock::get()?.unix_timestamp;
        entry.is_paid = true;
        entry.is_claimed = false;
        entry.entry_index = leaderboard.paid_entries_count;

        // Update leaderboard
        leaderboard.paid_entries_count += 1;
        leaderboard.accumulated_fud += PAID_ENTRY_COST;

        emit!(ScoreSubmitted {
            player: ctx.accounts.player.key(),
            score,
            is_paid: true,
            timestamp: entry.timestamp,
        });
        Ok(())
    }

    pub fn submit_free_score(ctx: Context<SubmitFreeScore>, score: u64) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        require!(!leaderboard.is_locked, LeaderboardError::LeaderboardLocked);
        require!(score > 0, LeaderboardError::InvalidScore);

        // Verify FUD balance
        require!(
            ctx.accounts.player_token_account.amount >= MINIMUM_FUD_TOKENS,
            LeaderboardError::InsufficientBalance
        );

        let entry = &mut ctx.accounts.score_entry;
        let now = Clock::get()?.unix_timestamp;

        // Check cooldown period
        if let Some(last_entry) = ctx.accounts.last_entry.as_ref() {
            require!(
                now - last_entry.timestamp > FREE_ENTRY_COOLDOWN,
                LeaderboardError::CooldownPeriodActive
            );
        }

        // Create score entry
        entry.player = ctx.accounts.player.key();
        entry.score = score;
        entry.timestamp = now;
        entry.is_paid = false;
        entry.is_claimed = false;
        entry.entry_index = leaderboard.free_entries_count;

        leaderboard.free_entries_count += 1;

        emit!(ScoreSubmitted {
            player: ctx.accounts.player.key(),
            score,
            is_paid: false,
            timestamp: now,
        });
        Ok(())
    }

    pub fn withdraw_fud(ctx: Context<WithdrawFud>, amount: u64) -> Result<()> {
        // First check the amount
        require!(
            amount <= ctx.accounts.leaderboard.accumulated_fud,
            LeaderboardError::InsufficientFunds
        );
    
        // Perform the transfer
        let seeds = &[];
        let signer = &[&seeds[..]];
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.leaderboard.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, amount)?;
    
        // Update the accumulated FUD after transfer
        let leaderboard = &mut ctx.accounts.leaderboard;
        leaderboard.accumulated_fud -= amount;
    
        emit!(WithdrawalMade {
            authority: ctx.accounts.authority.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
    
    pub fn reset_leaderboard(ctx: Context<ResetLeaderboard>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        
        // Lock leaderboard during reset
        leaderboard.is_locked = true;
        
        // Archive current entries if needed
        emit!(LeaderboardReset {
            authority: ctx.accounts.authority.key(),
            paid_entries: leaderboard.paid_entries_count,
            free_entries: leaderboard.free_entries_count,
            timestamp: Clock::get()?.unix_timestamp,
        });

        // Reset counters
        leaderboard.paid_entries_count = 0;
        leaderboard.free_entries_count = 0;
        
        // Unlock leaderboard
        leaderboard.is_locked = false;
        Ok(())
    }

    pub fn get_leaderboard_stats(ctx: Context<GetLeaderboardStats>) -> Result<LeaderboardStats> {
        let leaderboard = &ctx.accounts.leaderboard;
        Ok(LeaderboardStats {
            paid_entries: leaderboard.paid_entries_count,
            free_entries: leaderboard.free_entries_count,
            accumulated_fud: leaderboard.accumulated_fud,
            is_locked: leaderboard.is_locked,
        })
    }

    pub fn get_paginated_scores(
        ctx: Context<GetLeaderboardStats>,
        page: u64,
        page_size: u64
    ) -> Result<Vec<ScoreEntry>> {
        let leaderboard = &ctx.accounts.leaderboard;
        require!(
            page_size <= MAX_ENTRIES_PER_QUERY,
            LeaderboardError::InvalidPageSize
        );
        
        // Calculate start and end indices
        let start_index = page * page_size;
        let total_entries = leaderboard.paid_entries_count + leaderboard.free_entries_count;
        
        // Validate page bounds
        require!(
            start_index < total_entries,
            LeaderboardError::InvalidPage
        );
        
        // The scores will be fetched by the client by querying ScoreEntry accounts
        // using getProgramAccounts with the appropriate filters
        // We just need to return an empty vector here as the actual data
        // will be queried directly from the blockchain
        let scores = Vec::new();
        
        Ok(scores)
    }

    pub fn cleanup_nonces(ctx: Context<ResetLeaderboard>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        let now = Clock::get()?.unix_timestamp;
        leaderboard.used_nonces.retain(|n| now - n.timestamp < NONCE_EXPIRY);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 1 + (MAX_RESET_HISTORY * 24) + (100 * 16)
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitPaidScore<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 8 + 8 + 1 + 1 + 8,
        seeds = [b"score", player.key().as_ref(), leaderboard.paid_entries_count.to_le_bytes().as_ref()],
        bump
    )]
    pub score_entry: Account<'info, ScoreEntry>,
    #[account(mut)]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        constraint = player_token_account.owner == player.key(),
        constraint = player_token_account.mint == vault_token_account.mint
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitFreeScore<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 8 + 8 + 1 + 1 + 8,
        seeds = [b"score", player.key().as_ref(), leaderboard.free_entries_count.to_le_bytes().as_ref()],
        bump
    )]
    pub score_entry: Account<'info, ScoreEntry>,
    #[account(mut)]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        constraint = player_token_account.owner == player.key(),
    )]
    pub player_token_account: Account<'info, TokenAccount>,
    pub last_entry: Option<Account<'info, ScoreEntry>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawFud<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = authority_token_account.owner == authority.key(),
        constraint = authority_token_account.mint == vault_token_account.mint
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResetLeaderboard<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub leaderboard: Account<'info, Leaderboard>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetLeaderboardStats<'info> {
    pub leaderboard: Account<'info, Leaderboard>,
}

#[account]
pub struct Leaderboard {
    pub authority: Pubkey,
    pub paid_entries_count: u64,
    pub free_entries_count: u64,
    pub accumulated_fud: u64,
    pub is_locked: bool,
    pub reset_history: Vec<ResetRecord>,    // Add reset history
    pub used_nonces: Vec<NonceRecord>,      // Add nonce tracking
}

#[account]
pub struct ScoreEntry {
    pub player: Pubkey,
    pub score: u64,
    pub timestamp: i64,
    pub is_paid: bool,
    pub is_claimed: bool,
    pub entry_index: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct LeaderboardStats {
    pub paid_entries: u64,
    pub free_entries: u64,
    pub accumulated_fud: u64,
    pub is_locked: bool,
}

#[event]
pub struct ScoreSubmitted {
    pub player: Pubkey,
    pub score: u64,
    pub is_paid: bool,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawalMade {
    pub authority: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct LeaderboardReset {
    pub authority: Pubkey,
    pub paid_entries: u64,
    pub free_entries: u64,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ResetRecord {
    pub timestamp: i64,
    pub paid_entries: u64,
    pub free_entries: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct NonceRecord {
    pub nonce: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum LeaderboardError {
    #[msg("Insufficient funds in the vault")]
    InsufficientFunds,
    #[msg("Cooldown period is active")]
    CooldownPeriodActive,
    #[msg("Insufficient FUD token balance")]
    InsufficientBalance,
    #[msg("Invalid score submitted")]
    InvalidScore,
    #[msg("Leaderboard is currently locked")]
    LeaderboardLocked,
    #[msg("Nonce has already been used")]
    NonceAlreadyUsed,
    #[msg("Nonce has expired")]
    NonceExpired,
    #[msg("Page size exceeds maximum allowed")]
    InvalidPageSize,
    #[msg("Invalid page")]
    InvalidPage,
    #[msg("Invalid page number")]
    InvalidPageNumber,
}
