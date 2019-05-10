const { db } = require("../util/sql.js");
const { riotapi } = require("../tokens/config.json");
const request = require("request");

module.exports = {
    name: "삭제",
    description: "소환사를 롤창봇에 삭제합니다.",
    aliases: ["제거", "해제"],
    usage: "[소환사 이름]",
    cooldown: 2,
    guildOnly: true,
    args: 1,
    execute(message, args) {
        const nickname = args.join("");
        const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(nickname)}?api_key=${riotapi}`;
        request(url, { json: true }, (error, response, body) => {
            if (error) return console.log(error);

            if (!body.id) {
                return message.reply(`${nickname}는 누군지몰르겠는거임 똑바로치셈`);
            }

            db.query(`SELECT lol_id FROM lolchang.includes WHERE lol_id = '${body.accountId}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (!results.length) {
                    return message.reply(`없어서삭제몬하겟슴`);
                }

                const tempNickname = body.name;

                db.query(`DELETE FROM lolchang.includes WHERE lol_id = '${body.accountId}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                    if (error) return console.log(error);
                    message.channel.send(`\'${message.guild.name}\'에서 \'${tempNickname}\' 삭제 완료`);
                });
            });
        });
    },
};