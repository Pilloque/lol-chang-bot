const { globalPrefix } = require("../tokens/config.json");
const { getPrefix } = require("../util/prefixManager.js");

module.exports = {
    name: "명령어",
    description: "명령어들의 목록을 보여줍니다.",
    aliases: ["도움말", "명령"],
    usage: "{명령어 이름}",
    cooldown: 5,
    execute(message, args) {
        const prefix = getPrefix(message.guild.id) || globalPrefix;

        if (!args.length) {
            const exampleEmbed = {
                color: 0x0099ff,
                fields: [
                    {
                        name: ':page_facing_up: 계정',
                        value: `\`${prefix}등록 [소환사 이름]\`\n\`${prefix}삭제 [소환사 이름]\`\n\`${prefix}목록\``,
                    },
                    {
                        name: ':kiss_mm: 부계정',
                        value: `\`${prefix}부캐 등록 [본계정] [부계정]\`　 **\\*** *닉네임에 띄어쓰기는 생략*\n\`${prefix}부캐 삭제 [본계정] [부계정]\`　 **\\*** *닉네임에 띄어쓰기는 생략*\n\`${prefix}부캐 목록 [본계정]\``,
                    },
                    {
                        name: ':tv: 채널',
                        value: `\`${prefix}채널 등록\`\n\`${prefix}채널 삭제\`\n\`${prefix}채널 조회\``,
                    },
                    {
                        name: ':green_book: 기타',
                        value: `\`${prefix}명령어\`\n\`${prefix}명령어 [명령어 이름]\`\n\`${prefix}핑\`\n\`${prefix}prefix\``,
                    },
                ],
            };

            return message.channel.send({ embed: exampleEmbed });
        }

        const name = args[0].toLowerCase();
        const { commands } = message.client;
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
        const data = [];

        if (!command) {
            return message.reply("that's not a vaild command!");
        }

        data.push(`**명령어 :** \`${command.name}\``);

        if (command.aliases) data.push(`**같은 명령어 :** \`${command.aliases.join('\`, \`')}\``);
        if (command.description) data.push(`**설명 :** \`${command.description}\``);
        if (command.usage) data.push(`**사용법 :** \`${globalPrefix}${command.name} ${command.usage}\``);

        data.push(`**쿨타임 :** \`${command.cooldown || 2}초\``);

        message.channel.send(data, { split: true });
    },
};