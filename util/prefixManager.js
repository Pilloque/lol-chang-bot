const { querySync } = require("./sql.js");
const Discord = require("discord.js");

const prefixes = new Discord.Collection();

exports.getPrefix = function (guildID) {
    return prefixes.get(guildID) || undefined;
};

exports.updatePrefix = async function () {
    const results = await querySync(`SELECT * FROM lolchang.prefixes;`);
    if (!results.length) return;

    for (const r of results) {
        prefixes.set(r.guild_id, r.prefix);
    }
};