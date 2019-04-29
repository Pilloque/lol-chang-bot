module.exports = {
    name: "avatar",
    description: "avatar",
    aliases: ["icon", "프사"],
    execute(message, args) {
        if (!message.mentions.users.size) {
            return message.channel.send(`Your avartar: <${message.author.displayAvatarURL}>`);
        }

        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s avatar: <${user.displayAvatarURL}>`;
        });

        message.channel.send(avatarList);
    },
};