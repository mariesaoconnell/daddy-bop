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
	leaveOnStop: false,
});

// EVENT LISTENERS
client.on('ready', (client, interaction) => {
	console.log(`✅ ${client.user.username} is online! ✅`);
});

client.on('interactionCreate', (interaction) => {
	if (!interaction.isChatInputCommand()) return;

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

	if (interaction.commandName === 'play') {
		const song = interaction.options.get('song-name').value;
		const artist = interaction.options.get('artist').value;
		const userInput = `${song} ${artist}`;

		distube.play(interaction.member.voice.channel, userInput, {
			member: interaction.member,
			textChannel: interaction.channel,
			interaction,
		});
		interaction.reply(
			`🎶 **${song}** by **${artist}** 🎶 has been added to the queue! `
		);
	}

	if (interaction.commandName === 'stop') {
		distube.stop(interaction.member.voice.channel);
		interaction.reply(`🛑 **${client.user.username}** has been stopped! 🛑`);
	}

	if (interaction.commandName === 'skip') {
		distube.skip(interaction.member.voice.channel);
		interaction.reply(`⏭️ Skipping current song ⏩`);
	}

	if (interaction.commandName === 'pause') {
		distube.pause(interaction.member.voice.channel);
		interaction.reply(`⏸️ Paused ⏸️`);
	}

	if (interaction.commandName === 'resume') {
		distube.resume(interaction.member.voice.channel);
		interaction.reply(`⏯️ Resuming ⏯️`);
	}

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
	.on('finish', (queue) => queue.textChannel?.send('Finish queue!'))
	.on('finishSong', (queue) => queue.textChannel?.send('Finish song!'))
	.on('disconnect', (queue) => queue.textChannel?.send('Disconnected!'))
	.on('empty', (queue) =>
		queue.textChannel?.send(
			'🚨 The voice channel is empty! Leaving the voice channel... 🚨'
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
