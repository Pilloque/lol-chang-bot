module.exports = {
    name: "prune",
    description: "prune",
    aliases: ["삭제"],
    usage: "[amount]",
    //guildOnly: true,
    args: true,
    execute(message, args) {
        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return message.reply("that doesn't seem to be a valid number.");
        } else if (amount < 2 || amount > 100) {
            return message.reply("you need to input a number between 1 to 99.");
        }

        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send("there was an error tring to prune messages in this channel!");
        });
    },
};