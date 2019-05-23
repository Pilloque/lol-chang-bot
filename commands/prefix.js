const { db } = require("../util/sql.js");
const { updatePrefix } = require("../util/prefixManager.js");

module.exports = {
    name: "prefix",
    description: "prefix를 변경합니다.",
    //aliases: ["접두사"],
    usage: "[something]",
    cooldown: 5,
    guildOnly: true,
    args: 1,
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

        if (getByte(args[0]) > 14) {
            message.reply("바이트 제한 초과")
        }

        db.query(`SELECT * FROM lolchang.prefixes WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
            if (error) return console.log(error);

            if (results.length) {
                db.query(`UPDATE lolchang.prefixes SET prefix = '${args[0]}' WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                    if (error) return console.log(error);
                    updatePrefix();
                    message.channel.send(`\`${args[0]}\`을 prefix로 설정 :point_right: \`${args[0]}명령어\``);
                });
            } else {
                db.query(`INSERT INTO lolchang.prefixes VALUES (${message.guild.id}, '${args[0]}');`, (error, results, fields) => {
                    if (error) return console.log(error);
                    updatePrefix();
                    message.channel.send(`\`${args[0]}\`을 prefix로 설정 :point_right: \`${args[0]}명령어\``);
                });
            }
        });
    },
};

function getByte(s, b, i, c) {
    for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
    return b;
}