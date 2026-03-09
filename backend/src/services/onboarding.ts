/**
 *
 * Conversation state machine for new-user onboarding and withdrawal flow.
 *
 * Called from index.ts inside eventBus.onMessage().
 * Returns the text the bot should send back to the user.
 * Sending is done via replyToUser() which calls your existing
 * POST /api/message/send route internally.
 */

import { logger } from "../utils/logger";
import { generateKeypair, encryptSecretKey } from "../utils/stellar";
import {
  findUserByPhone,
  createUser,
  setUserStrategy,
  setUserWallet,
  setUserStep,
  setPendingWithdrawal,
  executeWithdrawal,
  cancelWithdrawal,
  addTransaction,
  Strategy,
  OnboardingStep,
  User,
} from "../db/userStore";
import { ParsedMessage } from "../types/whatsapp";
import {
  executeVaultWithdrawal,
  validateWithdrawalAmount,
  getStellarExpertLink,
} from "./withdrawal";
import {
  buildPortfolioBalanceReply,
  formatMidOnboardingReply,
  isBalanceIntent,
} from "./portfolio";
import {
  buildHistoryReply,
  isHistoryIntent,
} from "./history";

// ─── Strategy metadata ────────────────────────────────────────────────────────

const STRATEGIES: Record<
  Strategy,
  { label: string; apy: string; detail: string }
> = {
  conservative: {
    label: "Conservative 3–6%",
    apy: "3–6%",
    detail:
      "📊 *Conservative Strategy*\n" +
      "• 100% Blend lending (stable yield)\n" +
      "• Target APY: 3–6%\n" +
      "• Risk: Low\n" +
      "• Best for capital preservation",
  },
  balanced: {
    label: "Balanced 6–10%",
    apy: "6–10%",
    detail:
      "📊 *Balanced Strategy*\n" +
      "• 60% Blend lending (stable yield)\n" +
      "• 40% Stellar DEX liquidity (bonus fees)\n" +
      "• Target APY: 6–10%\n" +
      "• Risk: Medium",
  },
  growth: {
    label: "Growth 10–15%",
    apy: "10–15%",
    detail:
      "📊 *Growth Strategy*\n" +
      "• Aggressive multi-protocol deployment\n" +
      "• Blend + DEX + emerging Stellar DeFi\n" +
      "• Target APY: 10–15%\n" +
      "• Risk: Higher",
  },
};

// ─── Keyword maps ─────────────────────────────────────────────────────────────

const STRATEGY_MAP: Record<string, Strategy> = {
  conservative: "conservative",
  "conservative 3-6%": "conservative",
  "conservative 3–6%": "conservative",
  balanced: "balanced",
  "balanced 6-10%": "balanced",
  "balanced 6–10%": "balanced",
  growth: "growth",
  "growth 10-15%": "growth",
  "growth 10–15%": "growth",
};

const GREETINGS = new Set(["hi", "hello", "hey", "start", "helo", "yo"]);

/** Triggers that should show the help menu */
const HELP_TRIGGERS = new Set([
  "help",
  "?",
  "what can you do",
  "what do you do",
  "what can i do",
  "commands",
  "menu",
  "options",
  "features",
  "list commands",
  "show commands",
  "show menu",
  "what are my options",
]);

const WITHDRAWAL_KEYWORDS = new Set([
  "withdraw",
  "withdrawal",
  "cash out",
  "cashout",
  "take out",
  "take out my money",
  "send me my money",
]);

// ─── FAQ definitions ──────────────────────────────────────────────────────────

interface FaqEntry {
  patterns: RegExp[];
  answer: string;
}

const FAQ: FaqEntry[] = [
  {
    patterns: [
      /\bis\s+(my\s+)?money\s+safe\b/i,
      /\bsafe\b.*\bfunds?\b/i,
      /\bfunds?\b.*\bsafe\b/i,
      /\bsecure\b/i,
      /\bsecurity\b/i,
      /\blose\s+my\s+(money|funds|usdc)\b/i,
      /\bcan\s+i\s+trust\b/i,
      /\bis\s+this\s+(legit|legitimate|real|safe)\b/i,
      /\bwill\s+i\s+lose\b/i,
      /\bprotect(ed)?\s+my\s+(money|funds)\b/i,
    ],
    answer:
      "🔒 *Is my money safe?*\n\n" +
      "Your USDC is held in non-custodial Stellar smart contracts — " +
      "NeuroWealth never holds your funds directly.\n\n" +
      "• Your wallet keys are encrypted with AES-256-GCM\n" +
      "• Funds can only move with on-chain authorization\n" +
      "• No lock-ups — withdraw anytime\n\n" +
      "As with all DeFi, smart-contract risk exists. We only deploy to " +
      "audited protocols on Stellar.",
  },
  {
    patterns: [
      /\bhow\s+do\s+i\s+withdraw\b/i,
      /\bwithdraw\b.*\bhow\b/i,
      /\bget\s+my\s+(money|funds|usdc)\s+out\b/i,
      /\bcash\s+out\b/i,
      /\bpull\s+out\b/i,
      /\bwant\s+(my\s+)?(money|funds|usdc)\s+back\b/i,
      /\bsend\s+(money|funds|usdc)\s+to\s+me\b/i,
      /\bwithdraw\s+funds\b/i,
      /\bhow\s+to\s+withdraw\b/i,
    ],
    answer:
      "💸 *How do I withdraw?*\n\n" +
      "Reply *WITHDRAW [amount]* — for example:\n" +
      "  _WITHDRAW 500_\n\n" +
      "• Minimum withdrawal: 10 USDC\n" +
      "• Funds arrive in your external wallet within minutes\n" +
      "• No fees charged by NeuroWealth (Stellar network fee ~0.00001 XLM)\n\n" +
      "No lock-ups — withdraw any time, any amount.",
  },
  {
    patterns: [
      /\bminimum\b.*\bdeposit\b/i,
      /\bdeposit\b.*\bminimum\b/i,
      /\bhow\s+much\s+(do\s+i\s+need|to\s+start|minimum)\b/i,
      /\bminimum\s+investment\b/i,
      /\bsmallest\s+deposit\b/i,
      /\bhow\s+much\s+to\s+invest\b/i,
      /\bminimum\s+amount\b/i,
    ],
    answer:
      "💵 *Minimum deposit*\n\n" +
      "The minimum deposit is *10 USDC*.\n\n" +
      "There's no maximum — deposit as much as you like.\n" +
      "Reply *DEPOSIT* to get your wallet address.",
  },
  {
    patterns: [
      /\bfee[s]?\b/i,
      /\bhow\s+much\s+do\s+you\s+charge\b/i,
      /\bcharge[s]?\b/i,
      /\bcost[s]?\b/i,
      /\bcommission\b/i,
      /\bhow\s+much\s+does\s+it\s+cost\b/i,
      /\bdo\s+you\s+take\s+a\s+cut\b/i,
      /\bwhat\s+do\s+you\s+take\b/i,
      /\bperformance\s+fee\b/i,
      /\bhidden\s+(fee[s]?|charge[s]?)\b/i,
    ],
    answer:
      "💰 *Fees*\n\n" +
      "NeuroWealth charges a *10% performance fee* on yield earned — " +
      "you only pay when you profit.\n\n" +
      "• No deposit fees\n" +
      "• No withdrawal fees\n" +
      "• No monthly subscription\n" +
      "• Tiny Stellar network fee (~0.00001 XLM) on transactions",
  },
  {
    patterns: [
      /\bwhat\s+is\s+(usdc|stablecoin)\b/i,
      /\bwhat\s+network\b/i,
      /\bstellar\b.*\bwhat\b/i,
      /\bwhat\s+blockchain\b/i,
      /\bwhy\s+stellar\b/i,
      /\bwhat\s+is\s+stellar\b/i,
      /\bwhat\s+is\s+defi\b/i,
      /\bhow\s+does\s+(this|it|neurowealth)\s+work\b/i,
      /\bexplain\b.*\b(stellar|usdc|defi)\b/i,
    ],
    answer:
      "🌐 *About Stellar & USDC*\n\n" +
      "*USDC* is a USD-pegged stablecoin — 1 USDC = $1.\n\n" +
      "*Stellar* is a fast, low-cost blockchain used for payments and DeFi. " +
      "Transactions settle in ~5 seconds with fees under a cent.\n\n" +
      "⚠️ Only send *USDC on the Stellar network* to your NeuroWealth wallet. " +
      "Sending other tokens or USDC on Ethereum will result in lost funds.",
  },
  {
    patterns: [
      /\bchange\s+(my\s+)?strategy\b/i,
      /\bswitch\s+(my\s+)?strategy\b/i,
      /\bupdate\s+(my\s+)?strategy\b/i,
      /\bdifferent\s+strategy\b/i,
      /\bchange\s+my\s+plan\b/i,
      /\bswitch\s+plan\b/i,
    ],
    answer:
      "🔄 *Changing your strategy*\n\n" +
      "Reply with the strategy name at any time:\n" +
      "• *Conservative* — 3–6% APY, low risk\n" +
      "• *Balanced* — 6–10% APY, medium risk\n" +
      "• *Growth* — 10–15% APY, higher risk\n\n" +
      "Your funds will be rebalanced automatically at the next rebalance window.",
  },
  {
    patterns: [
      /\bhow\s+(do\s+)?i\s+(deposit|send\s+usdc|fund)\b/i,
      /\bdeposit\s+address\b/i,
      /\bwhere\s+do\s+i\s+send\b/i,
      /\bwallet\s+address\b/i,
      /\bhow\s+to\s+(add|put|send)\s+(money|funds|usdc)\b/i,
      /\bfund\s+my\s+account\b/i,
      /\bhow\s+to\s+deposit\b/i,
    ],
    answer:
      "📥 *How to deposit*\n\n" +
      "Reply *DEPOSIT* to get your personal USDC wallet address.\n\n" +
      "Then send USDC (Stellar network) to that address from any exchange " +
      "or wallet (Coinbase, Lobstr, XUMM, etc.).\n\n" +
      "Your funds are deployed automatically the moment they arrive. 🚀",
  },
  {
    patterns: [
      /\bwhen\s+(will\s+i\s+)?(get\s+)?paid\b/i,
      /\bwhen\s+do\s+i\s+earn\b/i,
      /\bhow\s+often\b.*\byield\b/i,
      /\byield\b.*\bhow\s+often\b/i,
      /\bcompound\b/i,
      /\brebalance\b/i,
      /\bwhen\s+do\s+i\s+get\s+(my\s+)?interest\b/i,
      /\bhow\s+is\s+(the\s+)?yield\s+paid\b/i,
      /\bdo\s+earnings\s+compound\b/i,
    ],
    answer:
      "⏱ *When do I earn yield?*\n\n" +
      "Yield accrues continuously and is compounded automatically.\n\n" +
      "• Rebalance checks run *every hour*\n" +
      "• Your portfolio value updates in real-time\n" +
      "• Reply *BALANCE* anytime to see your current earnings\n\n" +
      "Yield compounds into your position — no manual claiming needed.",
  },
  {
    patterns: [
      /\bwhat\s+can\s+(you|neurowealth)\s+do\b/i,
      /\bwhat\s+do\s+you\s+offer\b/i,
      /\bwhat\s+(are|is)\s+(your|the)\s+(feature[s]?|capabilities?|service[s]?)\b/i,
      /\btell\s+me\s+about\s+neurowealth\b/i,
      /\bwhat\s+is\s+neurowealth\b/i,
      /\babout\s+neurowealth\b/i,
      /\bhow\s+does\s+neurowealth\s+work\b/i,
    ],
    answer:
      "🤖 *What NeuroWealth can do for you*\n\n" +
      "NeuroWealth is your AI-powered DeFi agent on Stellar. Here's what I do:\n\n" +
      "• 💰 *Grow your USDC* — automatically, 24/7\n" +
      "• 📊 *Three strategies* — Conservative (3–6%), Balanced (6–10%), Growth (10–15%)\n" +
      "• 📥 *Instant deposits* — funds deployed the moment they arrive\n" +
      "• 💸 *Anytime withdrawals* — no lock-ups, no minimums (above 10 USDC)\n" +
      "• 📈 *Live balance* — reply BALANCE to check your earnings\n" +
      "• 🔒 *Non-custodial* — your keys, your funds\n\n" +
      "Reply *HELP* to see all available commands.",
  },
  {
    patterns: [
      /\bhow\s+much\s+(will\s+i\s+|can\s+i\s+)?earn\b/i,
      /\bwhat\s+(are\s+the\s+|is\s+the\s+)?returns?\b/i,
      /\bwhat\s+(is\s+the\s+|are\s+the\s+)?apy\b/i,
      /\binterest\s+rate\b/i,
      /\bhow\s+much\s+profit\b/i,
      /\bexpected\s+(return|yield|apy)\b/i,
    ],
    answer:
      "📈 *Expected returns*\n\n" +
      "Returns depend on your chosen strategy:\n\n" +
      "• *Conservative* — 3–6% APY (low risk)\n" +
      "• *Balanced* — 6–10% APY (medium risk)\n" +
      "• *Growth* — 10–15% APY (higher risk)\n\n" +
      "These are *target* APYs based on current DeFi protocol rates — " +
      "actual returns vary with market conditions.\n\n" +
      "Reply with a strategy name to get started, or *BALANCE* to check your current earnings.",
  },
  {
    patterns: [
      /\bam\s+i\s+locked\s+(in|up)\b/i,
      /\block[- ]up\b/i,
      /\bcan\s+i\s+(leave|exit|close|cancel)\b/i,
      /\bdelete\s+my\s+account\b/i,
      /\bclose\s+my\s+account\b/i,
      /\bstop\s+using\b/i,
      /\bnot\s+locked\b/i,
      /\bfree\s+to\s+withdraw\b/i,
    ],
    answer:
      "🔓 *No lock-ups, ever*\n\n" +
      "Your funds are never locked. You can withdraw any time, any amount (minimum 10 USDC).\n\n" +
      "Just reply *WITHDRAW* and your USDC is back in your wallet within seconds.\n\n" +
      "No cancellation fees, no exit penalties.",
  },
  {
    patterns: [
      /\breferral\b/i,
      /\binvite\s+(a\s+)?(friend|someone)\b/i,
      /\brefer\s+(a\s+)?friend\b/i,
      /\baffiliate\b/i,
    ],
    answer:
      "🎉 *Referrals*\n\n" +
      "A referral program is coming soon! 🚀\n\n" +
      "In the meantime, feel free to share your experience with friends. " +
      "They can get started by messaging this number.\n\n" +
      "Reply *HELP* to see what else you can do.",
  },
  {
    patterns: [
      /\bcontact\s+(support|us|you|team)\b/i,
      /\bspeak\s+to\s+(a\s+)?(human|person|agent|support)\b/i,
      /\btalk\s+to\s+(a\s+)?(human|person|agent)\b/i,
      /\bhuman\s+support\b/i,
      /\bget\s+help\b/i,
      /\bemail\b.*\bsupport\b/i,
      /\bsupport\s+email\b/i,
    ],
    answer:
      "🙋 *Contact Support*\n\n" +
      "For further assistance, reach our team at:\n" +
      "📧 support@neurowealth.io\n\n" +
      "We typically respond within a few hours.\n\n" +
      "You can also reply *HELP* to see all available commands — " +
      "I can answer most questions instantly!",
  },
];

// ─── Message builders ─────────────────────────────────────────────────────────

const WELCOME =
  "👋 Welcome to *NeuroWealth*! I'm your AI-powered DeFi agent on Stellar.\n\n" +
  "I grow your USDC automatically — 24/7, no dashboards needed.\n\n" +
  "Choose your investment strategy:\n" +
  "• *Conservative* (3–6% APY) — low risk, stablecoin lending\n" +
  "• *Balanced* (6–10% APY) — medium risk, lending + DEX\n" +
  "• *Growth* (10–15% APY) — higher risk, multi-protocol\n\n" +
  "Reply with *Conservative*, *Balanced*, or *Growth* to continue.";

const HELP_MSG =
  "🤖 NeuroWealth Commands\n" +
  "━━━━━━━━━━━━━━━━━━━━\n\n" +
  " balance — Check your portfolio\n" +
  " deposit — Get your deposit address\n" +
  " withdraw — Withdraw your funds\n" +
  " strategy — Change investment strategy\n" +
  " history — View recent transactions\n" +
  " help — Show this menu\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "Questions? Just ask in plain English!\n\n" +
  "Support: support@neurowealth.io";

function strategyDetail(strategy: Strategy): string {
  const s = STRATEGIES[strategy];
  return (
    `Great choice! Here's what *${strategy.charAt(0).toUpperCase() + strategy.slice(1)}* means:\n\n` +
    `${s.detail}\n\n` +
    `Ready to deposit? Minimum is *10 USDC*.\n\n` +
    `Reply *YES* to get your deposit address, or choose a different strategy:\n` +
    `• Conservative  • Balanced  • Growth`
  );
}

function depositAddress(walletAddress: string, strategy: Strategy): string {
  const s = STRATEGIES[strategy];
  return (
    `✅ Your NeuroWealth wallet is ready!\n\n` +
    `Send USDC to:\n` +
    `\`${walletAddress}\`\n\n` +
    `⚠️ *Only send USDC on the Stellar network.*\n\n` +
    `Your funds will be deployed into the *${strategy}* strategy (~${s.apy} APY) the moment they arrive. 🚀\n\n` +
    `I'll notify you as soon as your deposit is detected.\n` +
    `Need help? Reply *HELP* anytime.`
  );
}

function withdrawalPrompt(balance: number): string {
  return (
    `💸 *Withdrawal Request*\n\n` +
    `Your current balance: *${balance.toFixed(2)} USDC*\n\n` +
    `How much would you like to withdraw?\n\n` +
    `Reply:\n` +
    `• *ALL* — withdraw everything\n` +
    `• Type an amount (e.g., "200")\n` +
    `• *CANCEL* — cancel withdrawal`
  );
}

function withdrawalConfirm(amount: number, walletAddress: string): string {
  return (
    `Confirm withdrawal of *${amount.toFixed(2)} USDC*?\n\n` +
    `Funds will arrive at:\n` +
    `\`${walletAddress}\`\n\n` +
    `⏱ Takes ~10 seconds on Stellar\n\n` +
    `Reply:\n` +
    `• *CONFIRM* or *YES* ✅\n` +
    `• *CANCEL* or *NO* ❌`
  );
}

function withdrawalProcessing(): string {
  return `⏳ Processing withdrawal...\n\nThis will take about 10 seconds.`;
}

function withdrawalComplete(amount: number, txHash: string): string {
  return (
    `✅ *Withdrawal Complete!*\n\n` +
    `${amount.toFixed(2)} USDC sent to your wallet.\n\n` +
    `Transaction: ${txHash}\n` +
    `View on Stellar Expert: ${getStellarExpertLink(txHash)}\n\n` +
    `Thanks for using NeuroWealth! 💚\n` +
    `Reply *DEPOSIT* anytime to start again.`
  );
}

function withdrawalFailed(error: string): string {
  return (
    `❌ *Withdrawal Failed*\n\n` +
    `Error: ${error}\n\n` +
    `Your funds are safe. Reply *WITHDRAW* to try again or *HELP* for assistance.`
  );
}

function withdrawalCancelled(): string {
  return `Withdrawal cancelled. Your funds remain in your account.\n\nReply *HELP* to see what you can do.`;
}

/**
 * Try to match the user's free-text input against the FAQ bank.
 * Returns the FAQ answer string, or null if nothing matched.
 */
function matchFaq(input: string): string | null {
  for (const entry of FAQ) {
    for (const pattern of entry.patterns) {
      if (pattern.test(input)) {
        return entry.answer;
      }
    }
  }
  return null;
}

function fallback(step: OnboardingStep | string): string {
  switch (step) {
    case "awaiting_strategy":
      return (
        "I didn't catch that. 😊 Please choose a strategy:\n\n" +
        "• *Conservative* (3–6% APY)\n" +
        "• *Balanced* (6–10% APY)\n" +
        "• *Growth* (10–15% APY)\n\n" +
        "Or reply *HELP* to see all available commands."
      );
    case "awaiting_confirmation":
      return (
        "Reply *YES* to confirm and get your deposit address.\n\n" +
        "Or choose a different strategy:\n" +
        "• Conservative  • Balanced  • Growth\n\n" +
        "Or reply *HELP* to see all available commands."
      );
    default:
      return (
        "🤔 Hmm, I'm not sure what you mean — but here are a few things I *can* help with:\n\n" +
        "• *BALANCE* — view your portfolio\n" +
        "• *DEPOSIT* — get your deposit address\n" +
        "• *WITHDRAW [amount]* — withdraw funds\n" +
        "• *STRATEGY* — change your investment strategy\n" +
        "• *HELP* — see all commands\n\n" +
        "You can also ask me questions like:\n" +
        "_\"Is my money safe?\"_, _\"What are the fees?\"_, _\"How do I withdraw?\"_\n\n" +
        "Need human support? Email us at support@neurowealth.io 💚"
      );
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * handleOnboarding
 *
 * Pass every incoming ParsedMessage here.
 * Returns the reply string to send back, or null if nothing should be sent.
 *
 * Plugs into index.ts:
 *   eventBus.onMessage(async (msg) => {
 *     const reply = await handleOnboarding(msg, replyCallback);
 *     if (reply) await replyToUser(msg.from, msg.phone_number_id, reply);
 *   });
 */
export async function handleOnboarding(
  msg: ParsedMessage,
  replyCallback?: (to: string, phoneNumberId: string, text: string) => Promise<void>,
): Promise<string | null> {
  const { from, text, phone_number_id } = msg;
  const input = text.body.trim();
  const lower = input.toLowerCase();
  const requestedBalance = isBalanceIntent(lower);
  const requestedHistory = isHistoryIntent(lower);

  // ── HELP shortcut — works at any stage ───────────────────────────────────
  if (HELP_TRIGGERS.has(lower)) return HELP_MSG;

  // ── Look up user ──────────────────────────────────────────────────────────
  let user = await findUserByPhone(from);

  // ── Brand new user ────────────────────────────────────────────────────────
  if (!user) {
    logger.info({ from }, "New user — starting onboarding");
    await createUser(from);

    if (requestedBalance) {
      return (
        formatMidOnboardingReply("awaiting_strategy") +
        "\n\n" +
        "Choose: Conservative, Balanced, or Growth."
      );
    }

    if (requestedHistory) {
      return (
        "📜 Transaction History\n" +
        "━━━━━━━━━━━━━━━━━━━━\n\n" +
        "No transactions yet.\n\n" +
        "Reply *DEPOSIT* to get started!"
      );
    }

    // Try FAQ even for brand-new users
    const faqAnswer = matchFaq(input);
    if (faqAnswer) return faqAnswer + "\n\n" + "Reply *HI* to get started!";

    return WELCOME;
  }

  // ── Portfolio balance command ─────────────────────────────────────────────
  if (requestedBalance) {
    if (user.step !== "active") {
      return formatMidOnboardingReply(user.step);
    }

    return buildPortfolioBalanceReply(user);
  }

  // ── Transaction history command ───────────────────────────────────────────
  if (requestedHistory) {
    return buildHistoryReply(user);
  }

  // ── FAQ — plain-English questions, works at any stage ────────────────────
  const faqAnswer = matchFaq(input);
  if (faqAnswer) return faqAnswer;

  // ── Route by step ─────────────────────────────────────────────────────────
  return handleStep(user, from, input, lower, phone_number_id, replyCallback);
}

async function handleStep(
  user: User,
  from: string,
  input: string,
  lower: string,
  phoneNumberId: string,
  replyCallback?: (to: string, phoneNumberId: string, text: string) => Promise<void>,
): Promise<string> {
  // If they send a greeting again at any point → re-send welcome
  if (GREETINGS.has(lower) && user.step === "awaiting_strategy") {
    return WELCOME;
  }

  // ── Withdrawal intent detection (only for active users) ──────────────────
  if (user.step === "active" && isWithdrawalIntent(lower)) {
    if (user.balance <= 0) {
      return `You don't have any funds to withdraw. Your balance is 0 USDC.\n\nReply *DEPOSIT* to add funds.`;
    }
    await setUserStep(from, "withdrawal_amount");
    return withdrawalPrompt(user.balance);
  }

  switch (user.step) {
    case "awaiting_strategy": {
      const strategy = STRATEGY_MAP[lower];
      if (!strategy) return fallback("awaiting_strategy");
      await setUserStrategy(from, strategy);
      return strategyDetail(strategy);
    }

    case "awaiting_confirmation": {
      // User changed their mind on strategy
      const strategySwitch = STRATEGY_MAP[lower];
      if (strategySwitch) {
        await setUserStrategy(from, strategySwitch);
        return strategyDetail(strategySwitch);
      }

      if (lower !== "yes" && lower !== "y") {
        return fallback("awaiting_confirmation");
      }

      // Guard — shouldn't happen but be safe
      if (!user.strategy) {
        await setUserStep(from, "awaiting_strategy");
        return WELCOME;
      }

      // Generate wallet
      const { publicKey, secretKey } = generateKeypair();
      const encrypted = encryptSecretKey(secretKey);
      await setUserWallet(from, publicKey, encrypted);

      logger.info(
        { from, walletAddress: publicKey },
        "Stellar wallet created for user",
      );
      return depositAddress(publicKey, user.strategy);
    }

    case "awaiting_deposit": {
      if (lower === "deposit" || lower === "address") {
        if (user.walletAddress && user.strategy) {
          return depositAddress(user.walletAddress, user.strategy);
        }
      }
      return (
        `⏳ Your wallet is ready and waiting for a USDC deposit!\n\n` +
        `Deposit address:\n\`${user.walletAddress}\`\n\n` +
        `Reply *DEPOSIT* to see this again, or *HELP* for assistance.`
      );
    }

    case "withdrawal_amount": {
      if (lower === "cancel") {
        await setUserStep(from, "active");
        return withdrawalCancelled();
      }

      let amount: number;

      if (lower === "all") {
        amount = user.balance;
      } else {
        amount = parseFloat(input);
        const validationError = validateWithdrawalAmount(amount, user.balance);
        if (validationError) {
          return validationError + `\n\nAvailable: ${user.balance.toFixed(2)} USDC`;
        }
      }

      await setPendingWithdrawal(from, amount);
      return withdrawalConfirm(amount, user.walletAddress!);
    }

    case "withdrawal_confirm": {
      if (lower === "cancel" || lower === "no") {
        await cancelWithdrawal(from);
        return withdrawalCancelled();
      }

      if (lower !== "confirm" && lower !== "yes" && lower !== "y") {
        return (
          `Please reply:\n` +
          `• *CONFIRM* or *YES* to proceed\n` +
          `• *CANCEL* or *NO* to cancel`
        );
      }

      if (!user.pendingWithdrawal || !user.walletAddress || !user.encryptedPrivateKey) {
        await setUserStep(from, "active");
        return "Something went wrong. Please try again with *WITHDRAW*.";
      }

      const withdrawalAmount = user.pendingWithdrawal;

      // Execute withdrawal in background
      setImmediate(async () => {
        try {
          const result = await executeVaultWithdrawal(
            user.encryptedPrivateKey!,
            user.walletAddress!,
            withdrawalAmount,
          );

          if (result.success && result.txHash) {
            await executeWithdrawal(from);

            // Log withdrawal transaction
            await addTransaction({
              phone: from,
              type: "withdrawal",
              amount: withdrawalAmount,
              txHash: result.txHash,
              strategy: user.strategy || undefined,
              metadata: {
                walletAddress: user.walletAddress!,
              },
            });

            const successMsg = withdrawalComplete(withdrawalAmount, result.txHash);
            if (replyCallback) {
              await replyCallback(from, phoneNumberId, successMsg);
            }
            logger.info(
              { from, amount: withdrawalAmount, txHash: result.txHash },
              "Withdrawal completed successfully",
            );
          } else {
            await cancelWithdrawal(from);
            const errorMsg = withdrawalFailed(result.error || "Unknown error");
            if (replyCallback) {
              await replyCallback(from, phoneNumberId, errorMsg);
            }
            logger.error({ from, error: result.error }, "Withdrawal failed");
          }
        } catch (error: any) {
          await cancelWithdrawal(from);
          const errorMsg = withdrawalFailed(error.message);
          if (replyCallback) {
            await replyCallback(from, phoneNumberId, errorMsg);
          }
          logger.error({ from, error: error.message }, "Withdrawal exception");
        }
      });

      return withdrawalProcessing();
    }

    case "active": {
      // Named commands for active users
      if (lower === "deposit" || lower === "address") {
        if (user.walletAddress && user.strategy) {
          return depositAddress(user.walletAddress, user.strategy);
        }
      }

      if (lower === "strategy") {
        return (
          "🔄 *Change your strategy*\n\n" +
          "Reply with:\n" +
          "• *Conservative* — 3–6% APY, low risk\n" +
          "• *Balanced* — 6–10% APY, medium risk\n" +
          "• *Growth* — 10–15% APY, higher risk"
        );
      }

      if (lower === "history") {
        return buildHistoryReply(user);
      }

      // Check strategy switch for active users
      const strategySwitch = STRATEGY_MAP[lower];
      if (strategySwitch) {
        await setUserStrategy(from, strategySwitch);
        return strategyDetail(strategySwitch);
      }

      return fallback("active");
    }

    default:
      return fallback("unknown");
  }
}

function isWithdrawalIntent(lower: string): boolean {
  // Check exact matches
  if (WITHDRAWAL_KEYWORDS.has(lower)) return true;

  // Check if message contains withdrawal keywords
  for (const keyword of WITHDRAWAL_KEYWORDS) {
    if (lower.includes(keyword)) return true;
  }

  return false;
}