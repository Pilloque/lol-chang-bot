const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token } = require("./tokens/config.json");
const reader = require("./util/weekReader.js");

const client = new Discord.Client();
exports.client = client;

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}


client.once("ready", () => {
    console.log("Ready!");
    //require("./util/test.js")();
    require("./util/weeklyRank.js")();
});


client.on("message", (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (reader.get("workingState") === 1) {
        return message.reply("롤창 집계 중이라 몬함");
    }

    //Guild only
    if (command.guildOnly && message.channel.type !== "text") {
        return message.reply("DM에선 몬함");
    }

    //Arguments
    if (command.args && args.length < command.args) {
        let reply = `명령어그렇게쓰는거아닌데`;

        if (command.usage) {
            reply += `\n올바른 사용법: \`${prefix}${commandName} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    //Cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 2) * 1000; // (command.cooldown || cooldown_default)

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`쿨이여서몼씀. ${timeLeft.toFixed(1)}초 기달`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    //Execute
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("에러 발생");
    }
});


client.login(token);