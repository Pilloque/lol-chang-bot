const { db } = require("../sql.js");
const { riotapi } = require("../tokens/config.json");
const request = require("request");

module.exports = {
    name: "삭제",
    description: "소환사를 롤창봇에 삭제합니다.",
    aliases: ["제거", "해제"],
    usage: "[소환사 이름]",
    cooldown: 2,
    guildOnly: true,
    args: true,
    execute(message, args) {
        nickname = args.join("");
        encodedNickname = encodeURIComponent(nickname);
        const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedNickname}?api_key=${riotapi}`;
        request(url, { json: true }, (error, response, body) => {
            if (error) return console.log(error);

            if (!body.id) {
                return message.reply(`${nickname}이(가) 누군지 몰르겠는거임. 똑바로치셈`);
            }

            db.query(`SELECT lol_id FROM lolchang.includes WHERE lol_id = '${body.id}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (!results.length) {
                    return message.reply(`잇지도안은거임. 삭제몬함`);
                }

                db.query(`DELETE FROM lolchang.includes WHERE lol_id = '${body.id}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                    if (error) return console.log(error);
                });

                message.channel.send(`\'${message.guild.name}\'에서 \'${nickname}\' 삭제 완료`);
            });

        });
    },
};