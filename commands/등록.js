const { db } = require("../sql.js");
const { riotapi } = require("../tokens/config.json");
const request = require("request");

module.exports = {
    name: "등록",
    description: "소환사를 롤창봇에 등록합니다.",
    aliases: ["추가"],
    usage: "[소환사 이름]",
    cooldown: 2,
    guildOnly: true,
    args: true,
    execute(message, args) {
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

        nickname = args.join("");
        encodedNickname = encodeURIComponent(nickname);
        const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodedNickname}?api_key=${riotapi}`;
        request(url, { json: true }, (error, response, body) => {
            if (error) return console.log(error);

            if (!body.id) {
                return message.reply(`${nickname}이(가) 누군지 몰르겠는거임. 똑바로치셈`);
            }

            db.query(`SELECT lol_id FROM lolchang.members WHERE lol_id = '${body.id}';`, (error, results, fields) => {
                if (error) return console.log(error);

                if (!results.length) {
                    db.query(`INSERT INTO lolchang.members VALUES ('${body.id}', '${body.name}', ${body.summonerLevel});`, (error, results, fields) => {
                        if (error) return console.log(error);

                        console.log(`소환사 \'${body.name}\' 추가됨`);
                    });
                }
            });

            db.query(`SELECT lol_id FROM lolchang.includes WHERE lol_id = '${body.id}' AND guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (results.length) {
                    return message.reply(`이미등록댄거임. 똑바로하셈`);
                }

                db.query(`INSERT INTO lolchang.includes VALUES (${message.guild.id}, '${body.id}');`, (error, results, fields) => {
                    if (error) return console.log(error);
                });

                message.channel.send(`\'${message.guild.name}\'에 \'${nickname}\' 등록 완료`);
            });

        });
    },
};