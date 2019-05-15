const { db, querySync } = require("../util/sql.js");

module.exports = {
    name: "목록",
    description: "서버에 등록된 소환사들을 보여줍니다",
    aliases: ["소환사", "조회"],
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        db.query(`SELECT A.lol_id, A.nickname FROM lolchang.includes I, lolchang.accounts A WHERE guild_id = ${message.guild.id} AND A.lol_id = I.lol_id;`, async (error, results, fields) => {
            if (error) return console.log(error);

            if (!results.length) {
                return message.reply(`등록된 소환사 없음`);
            }

            let reply = `\`\`\`ini\n[${message.guild.name}에 등록된 소환사 목록]`;
            for (const account of results) {
                reply += `\n- ${account.nickname}`;
                subaccounts = await querySync(`SELECT * FROM lolchang.subaccounts WHERE primary_id = '${account.lol_id}' AND guild_id = ${message.guild.id}`);
                if (subaccounts.length) {
                    reply += ` (부캐 ${subaccounts.length}개)`;
                }
            }
            reply += "```";

            message.channel.send(reply);
        });
    },
};