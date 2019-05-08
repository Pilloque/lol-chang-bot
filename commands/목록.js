const { db } = require("../util/sql.js");

module.exports = {
    name: "목록",
    description: "서버에 등록된 소환사들을 보여줍니다",
    aliases: ["소환사", "조회"],
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        db.query(`SELECT M.nickname FROM lolchang.includes I, lolchang.members M WHERE guild_id = ${message.guild.id} AND M.lol_id = I.lol_id;`, (error, results, fields) => {
            if (error) return console.log(error);

            if (!results.length) {
                return message.reply(`등록된 소환사 없음`);
            }

            let reply = `\`\`\`ini\n[${message.guild.name}에 등록된 소환사 목록]`;
            for (const account of results) {
                reply += `\n- ${account.nickname}`;
            }
            reply += "```";

            message.channel.send(reply);
        });
    },
};