module.exports = {
    name: "천재",
    description: "천재",
    aliases: ["genius"],
    cooldown: 0.5,
    execute(message, args) {
        let ran;

        switch (Math.floor(Math.random() * 3)) {
            case 0:
                ran = "희";
                break;
            case 1:
                ran = "한";
                break;
            case 2:
                ran = "정";
                break;
            default:
                ran = "error";
                break;
        }
        
        message.channel.send(ran);
    },
};