const { SlashCommandBuilder } = require('discord.js');

const chess = require("../chess").Chess

module.exports = {
	data: new SlashCommandBuilder()
		.setName('accept')
		.setDescription('Accept a chess match!')
        .addUserOption(option =>
            option.setName('opponent')
            .setDescription('Who are you accepting (MAKE SURE YOUR IN THE CHANNEL YOU WERE INVITED IN!)'))
            .addStringOption(option => 
                option.setName("matchid")
                .setDescription("Match ID")),
	async execute(client, interaction) {
        const userID = interaction.user.id
        const opponent = interaction.options.getUser('opponent') ?? null;
        const matchid_lookup = interaction.options.getString('matchid') ?? null;
        

        if (opponent == null && matchid_lookup == null) {
            return await interaction.reply(`You didn't give me a player or Match ID! Make sure your in the channel you were invited in!!`)
        } else if (opponent && opponent == interaction.user) {
            return await interaction.reply(`You can't accept your self! Try starting match with someone using ${"`"}/start${"`"}`)
        }

		var matchData_FromChannel = null
        if (opponent) {
            var matchUUID_FromChannel = await client.database.get(`users.${opponent.id}.${interaction.channelId}`)
            matchData_FromChannel = await client.database.get(`matches.${matchUUID_FromChannel}`)
        }
        var matchData_FromLookup = await client.database.get(`matches.${matchid_lookup}`)

        var matchData = null
        var matchUUID = null

        if (matchData_FromChannel) {
            matchData = matchData_FromChannel
            matchUUID = matchUUID_FromChannel
        }
        if (matchData_FromLookup) {
            matchData = matchData_FromLookup
            matchUUID = matchid_lookup
        }

        if (matchData) {
            // await interaction.reply(`I found your match! Starting game...`);
            var f = await interaction.channel.send(`Match <@${matchData.ownerID}> VS <@${userID}> (Redering game and garbo)`)
            await client.database.set(`users.${userID}.${interaction.channelId}`, matchUUID)
            await client.database.set(`matches.${matchUUID}.players.${userID}.accepted`, true)
            const chessGame = new chess()
            var imgBuffer = await chessGame.render()

            var msg = await interaction.channel.send({content: `Match <@${matchData.ownerID}> VS <@${userID}>\nIt's <@${matchData.ownerID}> turn⁣`, files: [
                { attachment: imgBuffer }
            ]})
            await client.database.set(`matches.${matchUUID}.lastMsgID`, msg.id)
            await client.database.set(`matches.${matchUUID}.data`, chessGame.game.exportJson())
            f.delete()
        } else {
            return await interaction.reply(`Mhhh I couldn't find your match! Make sure your in the channel you were invited from. Also try using the match ID!`)
        }
        
	},
};