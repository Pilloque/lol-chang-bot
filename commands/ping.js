module.exports = {
    name: "ping",
    description: "Ping!",
    aliases: ["핑"],
    //usage: undefined,
    cooldown: 5,
    //guildOnly: false,
    //args: false,
    execute(message, args) {
        message.channel.send("Pong.");
    },
};