const { db } = require("../util/sql.js");
const { client } = require("../lolchang.js");

module.exports = {
    name: "채널",
    description: "주간 롤창 보고서를 표시할 채널을 등록하거나 삭제하거나 조회합니다.",
    aliases: ["주간채널"],
    usage: "[등록/삭제/조회]",
    cooldown: 2,
    guildOnly: true,
    args: 1,
    execute(message, args) {
        if (args[0] === "등록" || args[0] === "설정" || args[0] === "변경") {
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

            db.query(`SELECT channel_id FROM lolchang.channels WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (results.length) {
                    if (results[0].channel_id === message.channel.id) {
                        return message.reply(`이미등록댄거임 띵킹좀하셈`);
                    }

                    //Change channel
                    db.query(`UPDATE lolchang.channels SET channel_id = ${message.channel.id} WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                        if (error) return console.log(error);
                        message.channel.send(`채널 변경 완료`);
                    });
                } else {
                    //Add channel
                    db.query(`INSERT INTO lolchang.channels VALUES (${message.channel.id}, ${message.guild.id});`, (error, results, fields) => {
                        if (error) return console.log(error);
                        message.channel.send(`채널 등록 완료`);
                    });
                }
            });


        } else if (args[0] === "삭제" || args[0] === "제거") {
            db.query(`SELECT guild_id FROM lolchang.channels WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (!results.length) {
                    return message.reply(`없어서삭제몬하겟슴`);
                }

                db.query(`DELETE FROM lolchang.channels WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                    if (error) return console.log(error);
                    message.channel.send(`채널 삭제 완료`);
                });
            });


        } else if (args[0] === "조회" || args[0] === "정보") {
            db.query(`SELECT channel_id FROM lolchang.channels WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                if (error) return console.log(error);

                if (!results.length) {
                    return message.reply(`등록된 채널 없음`);
                }

                if (!client.channels.has(results[0].channel_id)) {
                    db.query(`DELETE FROM lolchang.channels WHERE guild_id = ${message.guild.id};`, (error, results, fields) => {
                        if (error) return console.log(error);
                    });
                    
                    return message.reply(`삭제된 채널`);
                }

                message.channel.send(`\`${client.channels.get(results[0].channel_id).name}\` 채널을 사용 중`);
            });
        }
    },
};