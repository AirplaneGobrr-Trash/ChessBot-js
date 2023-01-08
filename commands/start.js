const { SlashCommandBuilder } = require('discord.js');
const crypto = require("crypto")

function generateUUID() {
    // Get current time in 100 nanoseconds intervals since unix epoch
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // tslint:disable-next-line:no-bitwise
        const r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        // tslint:disable-next-line:no-bitwise
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Start a chess match!')
        .addUserOption(option =>
            option.setName('opponent')
            .setDescription('Who are ya gonna FIGHT! (Leave blank for AI WIP)'))
        .addIntegerOption(option =>
                option.setName("ailevel")
                .setDescription(`AI Level 1-5`)),
	async execute(client, interaction) {
        const userID = interaction.user.id
        const opponent = interaction.options.getUser('opponent') ?? null;
        const aiLevel = interaction.options.getInteger('ailevel') ?? null;
        console.log(userID, opponent, aiLevel)

        if (opponent == null && aiLevel == null){
            return await interaction.reply(`You didn't pick any options!`);
        } else if (opponent && opponent.bot){
            return await interaction.reply(`You can't VS a bot silly!`)
        } else if (opponent && opponent == interaction.user) {
            return await interaction.reply(`You can't play chess with your self! Maybe invite a friend or try AI mode!`)
        }
		
        var matchUUID = await client.database.get(`users.${userID}.${interaction.channelId}`)
        if (matchUUID) {
            await interaction.reply(`You are already in a match! ${matchUUID}`);
        } else {
            var id = opponent.id ?? aiLevel ?? null
            // await interaction.reply(`Undone`);
            matchUUID = generateUUID()
            await client.database.set(`users.${userID}.${interaction.channelId}`, matchUUID)
            await client.database.set(`matches.${matchUUID}`, {
                data: null,
                players: {
                    [userID]: { accepted: true, starter: true, color: "white" },
                    [id]: { accepted: false, starter: false, color: "black" }
                },
                startedAt: new Date().valueOf(),
                channelID: interaction.channelId,
                ownerID: userID
            })
            await interaction.reply(`You're moments away from starting your chess match with <@${id}>! Tell them to accept with ${"`"}/accept <user>${"`"} (MatchID: ${"`"}${matchUUID}${"`"})`)
        }
        
	},
};