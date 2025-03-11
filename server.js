require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
// Komanda /start - prikazuje glavni meni
bot.command("start", async (ctx) => {
    await ctx.reply(
        `Welcome to Light bot - the fastest and most secure trading bot for any token on the Solana network! ⚡

It seems like your wallet currently has no SOL. 

To begin trading, deposit SOL to your Light bot wallet address.
Once your deposit is complete, tap refresh to see your balance update. 🔄

For more details on your wallet and to export your seed phrase, tap "Wallet" below.

Note: This is the beta version of Light. The bot is still under development, and the full version is available only to a select few. Follow us on X and Telegram for more updates! ⚡`,
        Markup.inlineKeyboard([
            [Markup.button.callback("💰 Buy & Sell", "buy_sell"), Markup.button.callback("📌 Coin Sniper", "coin_sniper")],
            [Markup.button.callback("😎 Profile", "profile"), Markup.button.callback("💳 Wallets", "wallets"), Markup.button.callback("🔮 Trades", "trades")],
            [Markup.button.callback("🤖 Copy Trade", "copy_trade"), Markup.button.callback("⚙️ Settings", "settings")],
            [Markup.button.callback("✨ Positions", "positions"), Markup.button.callback("🔄 Refresh", "refresh")],
            [Markup.button.url("🌐 Website", "https://lightbot.org/"), Markup.button.url("✉️ Telegram", "https://t.me/lighonsolana")]
        ])
    );
});

// Komanda /website - bot šalje link ka web sajtu
bot.command("website", async (ctx) => {
    await ctx.reply("🌐 Visit our website: [Click here](https://lightbot.org/)", { parse_mode: "Markdown" });
});

// Komanda /twitter - bot šalje link ka Twitteru
bot.command("twitter", async (ctx) => {
    await ctx.reply("🐦 Follow us on Twitter: [Click here](https://x.com/lightbotsolana)", { parse_mode: "Markdown" });
});

// Komanda /chat - bot šalje link ka Telegram grupi
bot.command("chat", async (ctx) => {
    await ctx.reply("💬 Join our Telegram community: [Click here](https://t.me/lighonsolana)", { parse_mode: "Markdown" });
});

// Komanda /help - bot daje pomoćne informacije
bot.command("help", async (ctx) => {
    await ctx.reply("❓ If you have any questions or concerns, feel free to contact us on any social media platform or even ask in the Telegram community.", { parse_mode: "Markdown" });
});

// Glavni meni sa više dugmića
bot.start((ctx) => {
    ctx.reply(
        `Welcome to Light bot - the fastest and most secure trading bot for any token on the Solana network! ⚡

It seems like your wallet currently has no SOL. 

To begin trading, deposit SOL to your Light bot wallet address.
Once your deposit is complete, tap refresh to see your balance update. 🔄

For more details on your wallet and to export your seed phrase, tap "Wallet" below.

Note: This is the beta version of Light. The bot is still under development, and the full version is available only to a select few. Follow us on X and Telegram for more updates!`,
        Markup.inlineKeyboard([
            [Markup.button.callback("💰 Buy & Sell", "buy_sell"), Markup.button.callback("📌 Coin Sniper", "coin_sniper")],
            [Markup.button.callback("😎 Profile", "profile"), Markup.button.callback("💳 Wallets", "wallets"), Markup.button.callback("🔮 Trades", "trades")],
            [Markup.button.callback("🤖 Copy Trade", "copy_trade"), Markup.button.callback("⚙️ Settings", "settings")],
            [Markup.button.callback("✨ Positions", "positions"), Markup.button.callback("🔄 Refresh", "refresh")],
            [Markup.button.url("🌐 Website", "https://lightbot.org/"), Markup.button.url("✉️ Telegram", "https://t.me/lighonsolana")]
        ])
    );
});

// Buy & Sell dugme
// Čuvamo stanje korisnika
const buySellState = new Map();
// Funkcija koja resetuje stanje "Buy & Sell" kada korisnik klikne na drugo dugme
const resetUserState = (ctx) => {
    if (buySellState.has(ctx.from.id)) {
        buySellState.delete(ctx.from.id);
    }
};

// Buy & Sell dugme
bot.action("buy_sell", async (ctx) => {
    try {
        buySellState.set(ctx.from.id, "awaiting_token_contract"); // Postavljamo stanje
        await ctx.reply(
            "📌 Paste token contract to begin buy & sell ↔️",
            Markup.inlineKeyboard([
                [Markup.button.callback("❌ Close", "delete_message")]
            ])
        );
    } catch (err) {
        console.error("❌ Greška pri slanju poruke:", err);
    }
});

// Kada korisnik pošalje poruku
bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    const state = buySellState.get(userId);

    if (state === "awaiting_token_contract" || state === "awaiting_token_contract_sniper") {
        // Nakon prve poruke prelazimo na čekanje holder key-a
        buySellState.set(userId, "awaiting_holder_key");
        await ctx.reply("Enter a unique holder key to start trading.");
    } else if (state === "awaiting_holder_key") {
        // Ako korisnik unese nešto u ovoj fazi, dobiće poruku "Wrong input"
        await ctx.reply("⚠️ Wrong input");
    } else {
        // Ako nije u procesu, odgovaramo podrazumevano
        ctx.reply("🚧 still under development!");
    }
});

// Coin Sniper dugme
bot.action("coin_sniper", async (ctx) => {
    buySellState.set(ctx.from.id, "awaiting_token_contract_sniper"); // Postavljamo stanje isto kao za Buy & Sell
    await ctx.reply(
        "📌 Paste token contract to create a sniper ↔️",
        Markup.inlineKeyboard([
            [Markup.button.callback("❌ Close", "delete_message")]
        ])
    );
});

// Brisanje poruke pritiskom na "Close"
bot.action("delete_message", async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    } catch (err) {
        console.error("❌ Greška pri brisanju poruke:", err);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

// Brisanje poruke za Coin Sniper pritiskom na "Close"
bot.action("delete_sniper_message", async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    } catch (err) {
        console.error("❌ Greška pri brisanju poruke:", err);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

// Ostala dugmad
bot.action("profile", async (ctx) => {
    await ctx.reply(
        "You don't have any wallet yet, click on \"wallets\" option to create one."
    );
    setTimeout(() => resetUserState(ctx), 500);
});

const walletMessages = new Map(); // Čuva ID poruka za brisanje

bot.action("wallets", async (ctx) => {
    try {
        const sentMessage = await ctx.reply(
            getWalletText(), // Dinamički generisan tekst
            getWalletKeyboard() // Dinamički generisana tastatura
        );

        walletMessages.set(ctx.from.id, sentMessage.message_id); // Čuvamo ID poruke za kasnije brisanje
    } catch (err) {
        console.error("❌ Greška pri slanju poruke:", err);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

bot.action("connect_wallet", async (ctx) => {
    await ctx.reply("Coming soon! Visit our website for more info.");
    setTimeout(() => resetUserState(ctx), 500);
});

bot.action("generate_wallet", async (ctx) => {
    await ctx.reply("Coming soon! Visit our website for more info.");
    setTimeout(() => resetUserState(ctx), 500);
});

// "Reload" sada menja postojeću poruku umesto da šalje novu
bot.action("reload_wallet", async (ctx) => {
    try {
        await ctx.editMessageText(getWalletText(), getWalletKeyboard());
    } catch (err) {
        console.error("❌ Greška pri osvežavanju poruke:", err);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

// Dugme za brisanje poruke
bot.action("delete_wallet_message", async (ctx) => {
    try {
        const messageId = walletMessages.get(ctx.from.id);
        if (messageId) {
            await ctx.deleteMessage(messageId);
            walletMessages.delete(ctx.from.id);
        } else {
            console.log("❌ Nema poruke za brisanje!");
        }
    } catch (err) {
        console.error("❌ Greška pri brisanju poruke:", err);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

// Funkcija koja generiše tekst poruke (možeš je proširiti kasnije)
function getWalletText() {
    return "You don't have any wallet yet, please create a wallet to use.";
}

// Funkcija koja generiše dugmiće
function getWalletKeyboard() {
    return Markup.inlineKeyboard([
        [Markup.button.callback("🔗 Connect Wallet", "connect_wallet"), Markup.button.callback("🆕 Generate New Wallet", "generate_wallet")],
        [Markup.button.callback("🔄 Reload", "reload_wallet")],
        [Markup.button.callback("❌ Close", "delete_wallet_message")]
    ]);
}

bot.action("trades", async (ctx) => {
    await ctx.reply("You don't have any transactions yet");
    setTimeout(() => resetUserState(ctx), 500);
});

bot.action("copy_trade", async (ctx) => {
    await ctx.reply("Send Solana address to copy trade");
    setTimeout(() => resetUserState(ctx), 500);
});

// Čuvamo stanje dugmadi za svakog korisnika
const settingsState = new Map();

bot.action("settings", async (ctx) => {
    const userId = ctx.from.id;
    settingsState.set(userId, {
        antiMev: "🟢",
        antiMevSniper: "🟢",
        turboTip: "🔴",
        feePriority: "🟢"
    });

    const message = await ctx.reply(getSettingsMessage(userId), getSettingsKeyboard(userId));
    settingsState.get(userId).messageId = message.message_id;
    setTimeout(() => resetUserState(ctx), 500);
});

bot.action(/^toggle_(antiMev|antiMevSniper|turboTip|feePriority)$/, async (ctx) => {
    const userId = ctx.from.id;
    const setting = ctx.match[1];

    if (settingsState.has(userId)) {
        // Menjamo stanje dugmeta
        settingsState.get(userId)[setting] = settingsState.get(userId)[setting] === "🟢" ? "🔴" : "🟢";
        const messageId = settingsState.get(userId).messageId;

        // Ažuriramo postojeću poruku sa novim stanjem
        await ctx.telegram.editMessageText(ctx.chat.id, messageId, null, getSettingsMessage(userId), getSettingsKeyboard(userId));
    }
});

bot.action("close_settings", async (ctx) => {
    const userId = ctx.from.id;
    const messageId = settingsState.get(userId)?.messageId;

    if (messageId) {
        await ctx.deleteMessage(messageId);
        settingsState.delete(userId);
    }
    setTimeout(() => resetUserState(ctx), 500);
});

// Funkcija za generisanje poruke
function getSettingsMessage(userId) {
    return `ANTI MEV:
Secure your transaction, of course your transaction may be failed.

TURBO TIP:
If auto tip is enabled, the tip value will be automatically adjusted based on the jito realtime system.

FEE PRIORITY:
If auto fee is enabled, the priority fee value will be automatically adjusted based on chain.

ANTI-MEV Sniper:
Secure your sniper transaction of course your transaction may be failed.

Note:
* Tip amount will be adjusted based on the time of day according to our algorithm to improve the transaction success rate.`;
}

// Funkcija za generisanje tastature
function getSettingsKeyboard(userId) {
    const state = settingsState.get(userId);
    return Markup.inlineKeyboard([
        [Markup.button.callback(`ANTI MEV ${state.antiMev}`, "toggle_antiMev"), Markup.button.callback(`ANTI MEV Sniper ${state.antiMevSniper}`, "toggle_antiMevSniper")],
        [Markup.button.callback(`TURBO TIP ${state.turboTip}`, "toggle_turboTip"), Markup.button.callback(`FEE PRIORITY ${state.feePriority}`, "toggle_feePriority")],
        [Markup.button.callback("Close", "close_settings")]
    ]);
}

bot.action("positions", async (ctx) => {
    await ctx.reply("No open positions");
    setTimeout(() => resetUserState(ctx), 500);
});

bot.action("refresh", (ctx) => ctx.reply("🔄 Refreshing..."));

// Kada korisnik pošalje bilo koju poruku, bot odgovara "Još uvek u razvoju"
bot.on("message", async (ctx) => {
    if (ctx.message.text && ctx.message.text.startsWith("/")) {
        return; // Ako je poruka komanda, nemoj slati "still under development"
    }
    await ctx.reply("🚧 still under development!");
});


bot.launch();

console.log("✅ Bot je pokrenut!");