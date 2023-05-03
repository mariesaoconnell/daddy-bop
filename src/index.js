require('dotenv/config');
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');

// CLIENT = BOT.. INITIALIZE CLIENT
const client = new Client({
	// INTENTS ARE PERMISSIONS
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildVoiceStates,
	],
});


// INITIALIZE DISTUBE
const distube = new DisTube(client, {
	searchSongs: 5,
	searchCooldown: 30,
	leaveOnEmpty: false,
	leaveOnFinish: false,
	leaveOnStop: true,
	leaveOnEmpty: true,
});

// --- EVENT LISTENER BLOCK ---

client.on('ready', (client, interaction) => {
	console.log(`✅ ${client.user.username} is online! ✅`);
});

// EVENT LISTENER FOR SLASH COMMAND
client.on('interactionCreate', (interaction) => {

	if (interaction.member.voice.channel) {
		// IF USER IS IN A VOICE CHANNEL, PROCEED WITH CONDITIONAL BLOCKS
		// HELP
		if (interaction.commandName === 'help') {
			const embed = new EmbedBuilder()
				.setTitle('Daddy Bop Commands')
				.setAuthor({
					name: 'Daddy Bop',
					iconURL: 'https://i.ibb.co/Bt83V56/DADDY-BOP-2.png',
				})
				.setColor('Random')
				.setThumbnail('https://i.ibb.co/Bt83V56/DADDY-BOP-2.png')
				.addFields(
					{
						name: '/play',
						value: 'Plays a given song by a given artist',
						inline: true,
					},
					{
						name: '/pause',
						value: 'Pauses the current song that is playing',
						inline: true,
					},
					{
						name: '/stop',
						value: 'Stops the current song that is playing',
						inline: true,
					},
					{
						name: '/skip',
						value: 'Skips the current song that is playing',
						inline: true,
					},
					{
						name: '/resume',
						value: 'Resumes the song that is paused',
						inline: true,
					},
					{
						name: '/queue',
						value: 'Gets the queue of songs',
						inline: true,
					}
				)
				.setFooter({
					text: 'Enjoy the bops!',
					iconURL: 'https://i.ibb.co/Bt83V56/DADDY-BOP-2.png',
				});
			interaction.reply({ embeds: [embed] });
		}

		// PLAY

		if (interaction.commandName === 'play') {
			let artist

			const song = interaction.options.get('song-name').value;
			if(interaction.options.get('artist')){
				artist = interaction.options.get('artist').value;
			}

			const userInput = `${song} ${artist}`;

			if (!interaction.member.voice.channel) {
				interaction.reply('You gotta join a voice channel, silly! 😝');
			}

			distube.play(interaction.member.voice.channel, userInput, {
				member: interaction.member,
				textChannel: interaction.channel,
				interaction,
			});

			if(artist){
				interaction.reply(
					`🎶 **${song}** by **${artist}** 🎶 has been added to the queue! `
				);
			}
			else {
				interaction.reply(
					`🎶 **${song}** 🎶 has been added to the queue! `
				);
			}
		}

		// STOP

		if (interaction.commandName === 'stop') {
			try {
				distube.stop(interaction.member.voice.channel);
				interaction.reply(
					`🛑 **${client.user.username}** has been stopped & Disconnected! 🛑`
				);
			} catch (error) {
				console.log(error);
				interaction.reply(`No songs to stop 😢`);
			}
		}

		// SKIP

		if (interaction.commandName === 'skip') {
			try {
				distube.skip(interaction.member.voice.channel);
				interaction.reply(`⏭️ Skipping current song ⏩`);
			} catch (error) {
				interaction.reply(`No songs to skip 😢`);
			}
		}

		// PAUSE
		if (interaction.commandName === 'pause') {
			try {
				distube.pause(interaction.member.voice.channel);
				interaction.reply(`⏸️ Paused ⏸️`);
			} catch (error) {
				interaction.reply(`No songs to pause 😢`);
			}
		}

		// RESUME
		if (interaction.commandName === 'resume') {
			try {
				distube.resume(interaction.member.voice.channel);
				interaction.reply(`⏯️ Resuming ⏯️`);
			} catch (error) {
				interaction.reply(`No songs to resume 😢`);
			}
		}

		// QUEUE
		if (interaction.commandName === 'queue') {
			const queue = distube.getQueue(interaction);

			if (!queue) {
				interaction.reply(`👀 Nothing playing right now! 👀 `);
			} else {
				interaction.reply(
					`Current queue:\n${queue.songs
						.map(
							(song, id) =>
								`**${id ? id : 'Playing'}**. ${song.name} - \`${
									song.formattedDuration
								}\``
						)
						.slice(0, 10)
						.join('\n')}`
				);
			}
		}
	} else {
		interaction.reply(`You must join a voice channel!`); // IF USER IS NOT IN A VOICE CHANNEL, REPLY ADV USER TO JOIN A VC
	}
});

const status = (queue) =>
	`Volume: \`${queue.volume}%\` || 'Off'
	}\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``;

distube

	.on('error', (textChannel, e) => {
		console.error(e);
		textChannel.send(`An error encountered: ${e.message.slice(0, 2000)}`);
	})
	// .on('disconnect', (queue) => queue.textChannel?.send('***Daddy Bot*** has been Disconnected!'))
	.on('empty', (queue) =>
		queue.textChannel?.send(
			"✌️ The voice channel is empty, I'm outta here! ✌️ "
		)
	)

	.on('searchResult', (message, result) => {
		let i = 0;
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					(song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
				)
				.join('\n')}\n*Enter anything else or wait 30 seconds to cancel*`
		);
	})
	.on('searchCancel', (message) => message.channel.send('Searching canceled'))
	.on('searchInvalidAnswer', (message) =>
		message.channel.send('Invalid number of result.')
	)
	.on('searchNoResult', (message) => message.channel.send('No result found!'))
	.on('searchDone', () => {});

client.login(process.env.TOKEN);
