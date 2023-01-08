const { SlashCommandBuilder } = require('discord.js');

const chess = require("../chess").Chess

module.exports = {
	data: new SlashCommandBuilder()
		.setName('move')
		.setDescription('Move a chess piece')
        .addStringOption(option =>
            option.setName('source')
                .setDescription('The piece you want to move')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('destination')
                .setDescription('Where you want to place the piece')
                .setRequired(true)),
	async execute(client, interaction) {
        const userID = interaction.user.id
        const src = interaction.options.getString('source');
        const dest = interaction.options.getString('destination');
		
        
        var matchUUID = await client.database.get(`users.${userID}.${interaction.channelId}`)
        var matchData = await client.database.get(`matches.${matchUUID}`)
        if (matchData) {
            var playerColor = matchData.players[userID].color
            if (matchData.data.turn == playerColor) {
                if (matchData.data.moves[src].includes(dest)) {
                    const game = new chess(matchData.data)
                    game.game.move(src, dest)
                    var imgBuffer = await game.render()
                    var msg = await interaction.channel.send({content: `Match <@${matchData.ownerID}> VS <@${userID}>\nIt's <@${matchData.ownerID}> turn⁣`, files: [
                        { attachment: imgBuffer }
                    ]})
                    await client.database.set(`matches.${matchUUID}.lastMsgID`, msg.id)
                    client.database.set(`matches.${matchUUID}.data`, game.game.exportJson())
                } else {
                    interaction.reply({content: "Invaild move!", ephemeral: true})
                }
                
                
            } else {
                interaction.reply({content: "It's not your turn!", ephemeral: true})
            }
            console.log(matchData.data)
            
        } else {
            await interaction.reply("It looks like your not in a chess match! Start one with /start")
        }
        
	},
};