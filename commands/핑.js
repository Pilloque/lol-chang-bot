module.exports = {
    name: "핑",
    description: "핑 체크",
    aliases: ["ping"],
    //usage: undefined,
    cooldown: 5,
    //guildOnly: true,
    //args: false,
    execute(message, args) {
        message.channel.send(`퐁 ${message.client.ping}ms`);
    },
};