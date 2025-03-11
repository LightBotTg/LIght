require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Glavni meni sa više dugmića
bot.start((ctx) => {
    ctx.reply(
        ` Welcome to Light bot - the fastest and most secure trading bot for any token on the Solana network! ⚡

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
            [Markup.button.url("🌐 Website", "https://yourwebsite.com"), Markup.button.url("✉️ Telegram", "https://t.me/yourchannel")]
        ])
    );
});

// Buy & Sell dugme
// Čuvamo stanje korisnika
const buySellState = new Map();

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

    if (state === "awaiting_token_contract") {
        // Nakon prve poruke prelazimo na čekanje holder key-a
        buySellState.set(userId, "awaiting_holder_key");
        await ctx.reply("Enter a unique holder key to start trading.");
    } else if (state === "awaiting_holder_key") {
        // Ako korisnik unese nešto u ovoj fazi, dobiće poruku "Wrong input"
        await ctx.reply("⚠️ Wrong input");
    } else {
        // Ako nije u procesu, odgovaramo podrazumevano
        ctx.reply(`🚧 still under development! 
        
        This is the beta version of Light. The bot is still under development, and the full version is available only to a select few. Follow us on X and Telegram for more updates! 🔧`);
    }
});

// Resetovanje stanja kada se klikne bilo koje dugme (osim Buy & Sell)
bot.action([ "coin_sniper", "profile", "wallets", "trades", "copy_trade", "settings", "positions", "refresh", "delete_message"], async (ctx) => {
    resetUserState(ctx);
});


// Coin Sniper dugme
bot.action("coin_sniper", async (ctx) => {
    resetUserState(ctx);
    try {
        await ctx.reply(
            "Active Snipers: 0\n\nPaste token address to create new sniper!",
            Markup.inlineKeyboard([
                [Markup.button.callback("📋 Lists", "sniper_lists")],
                [Markup.button.callback("❌ Close", "delete_sniper_message")]
            ])
        );
    } catch (err) {
        console.error("❌ Greška pri slanju poruke:", err);
    }
});

// Dugme Lists
bot.action("sniper_lists", (ctx) => {
    resetUserState(ctx);
    ctx.reply("🚧 Still under development");
});

// Brisanje poruke pritiskom na "Close"
bot.action("delete_message", async (ctx) => {
    resetUserState(ctx);
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    } catch (err) {
        console.error("❌ Greška pri brisanju poruke:", err);
    }
});

// Brisanje poruke za Coin Sniper pritiskom na "Close"
bot.action("delete_sniper_message", async (ctx) => {
    resetUserState(ctx);
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    } catch (err) {
        console.error("❌ Greška pri brisanju poruke:", err);
    }
});

// Ostala dugmad
bot.action("profile", async (ctx) => {
    resetUserState(ctx);
    await ctx.reply(
        "You don't have any wallet yet, click on \"wallets\" option to create one."
    );
});

const walletMessages = new Map(); // Čuva ID poruka za brisanje

bot.action("wallets", async (ctx) => {
    resetUserState(ctx);
    try {
        const sentMessage = await ctx.reply(
            getWalletText(), // Dinamički generisan tekst
            getWalletKeyboard() // Dinamički generisana tastatura
        );

        walletMessages.set(ctx.from.id, sentMessage.message_id); // Čuvamo ID poruke za kasnije brisanje
    } catch (err) {
        console.error("❌ Greška pri slanju poruke:", err);
    }
});

bot.action("connect_wallet", async (ctx) => {
    resetUserState(ctx);
    await ctx.reply("Coming soon! Visit our website for more info.");
});

bot.action("generate_wallet", async (ctx) => {
    resetUserState(ctx);
    await ctx.reply("Coming soon! Visit our website for more info.");
});

// "Reload" sada menja postojeću poruku umesto da šalje novu
bot.action("reload_wallet", async (ctx) => {
    resetUserState(ctx);
    try {
        await ctx.editMessageText(getWalletText(), getWalletKeyboard());
    } catch (err) {
        console.error("❌ Greška pri osvežavanju poruke:", err);
    }
});

// Dugme za brisanje poruke
bot.action("delete_wallet_message", async (ctx) => {
    resetUserState(ctx);
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
    resetUserState(ctx);
    await ctx.reply("You don't have any transactions yet");
});

bot.action("copy_trade", async (ctx) => {
    resetUserState(ctx);
    await ctx.reply("Send Solana address to copy trade");
});

// Čuvamo stanje dugmadi za svakog korisnika
const settingsState = new Map();

bot.action("settings", async (ctx) => {
    resetUserState(ctx);
    const userId = ctx.from.id;
    settingsState.set(userId, {
        antiMev: "🟢",
        antiMevSniper: "🟢",
        turboTip: "🔴",
        feePriority: "🟢"
    });

    const message = await ctx.reply(getSettingsMessage(userId), getSettingsKeyboard(userId));
    settingsState.get(userId).messageId = message.message_id;
});

bot.action(/^toggle_(antiMev|antiMevSniper|turboTip|feePriority)$/, async (ctx) => {
    resetUserState(ctx);
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
    resetUserState(ctx);
    const userId = ctx.from.id;
    const messageId = settingsState.get(userId)?.messageId;

    if (messageId) {
        await ctx.deleteMessage(messageId);
        settingsState.delete(userId);
    }
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
    resetUserState(ctx);
    await ctx.reply("No open positions");
});

bot.action("refresh", (ctx) => ctx.reply("🔄 Refreshing..."));
resetUserState(ctx);

// Kada korisnik pošalje bilo koju poruku, bot odgovara "Još uvek u razvoju"
bot.on("message", (ctx) => {
    resetUserState(ctx);
    ctx.reply(`🚧 still under development! 
        
        This is the beta version of Light. The bot is still under development, and the full version is available only to a select few. Follow us on X and Telegram for more updates! 🔧`);
});

bot.launch();
console.log("✅ Bot je pokrenut!");









