const { db, querySync } = require("../util/sql.js");
const { riotapi } = require("../tokens/config.json");
const request = require("request");

module.exports = {
    name: "등록",
    description: "소환사를 롤창봇에 등록합니다.",
    aliases: ["추가"],
    usage: "[소환사 이름]",
    cooldown: 2,
    guildOnly: true,
    args: 1,
    async execute(message, args) {
        //Check if guild is in db. If not, add to db.
        db.query(`SELECT guild_id FROM lolchang.guilds WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
            if (error) return console.log(error);

            if (!results.length) {
                db.query(`INSERT INTO lolchang.guilds VALUES (${message.guild.id}, '${message.guild.name}', CURDATE());`, (error, results, fields) => {
                    if (error) throw error;
                    console.log(`길드 \'${message.guild.name}\' 추가됨`);
                });
            }
        });

        const includedCount = (await querySync(`SELECT COUNT(*) FROM lolchang.includes WHERE guild_id = ${message.guild.id};`))[0]["COUNT(*)"];
        if (includedCount >= 64) {
            return message.reply(`소환사 등록 제한 초과`);
        }

        const nickname = args.join("");
        const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(nickname)}?api_key=${riotapi}`;
        request(url, { json: true }, async (error, response, body) => {
            if (error) return console.log(error);

            if (!body.id) {
                return message.reply(`\`${nickname}\`는 누군지몰르겠는거임 똑바로치셈`);
            }

            const accountCheck = await querySync(`SELECT lol_id FROM lolchang.accounts WHERE lol_id = '${body.accountId}';`);
            if (!accountCheck.length) {
                await querySync(`INSERT INTO lolchang.accounts VALUES ('${body.accountId}', '${body.name}', ${body.summonerLevel});`);
                console.log(`소환사 \'${body.name}\' 추가됨`);
            }

            db.query(`SELECT lol_id FROM lolchang.includes WHERE lol_id = '${body.accountId}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (results.length) {
                    return message.reply(`이미등록댄거임 띵킹좀하셈`);
                }

                db.query(`INSERT INTO lolchang.includes VALUES (${message.guild.id}, '${body.accountId}');`, (error, results, fields) => {
                    if (error) return console.log(error);
                    message.channel.send(`\`${message.guild.name}\`에 \`${body.name}\` 등록 완료`);
                });
            });
        });
    },
};