require('dotenv').config();
const {REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const commands = [
  {
    name: 'play',
    description: 'Plays a song.',
    options: [
      {
      name: 'song-name',
      description: 'Song you want to play.',
      type: ApplicationCommandOptionType.String,
      required: true
    },
      {
      name: 'artist',
      description: 'Artist of the song you want to play.',
      type: ApplicationCommandOptionType.String,
      required: false
    },
  ]
  },
  {
    name: 'stop',
    description: 'Stops player.'
  },
  {
    name: 'skip',
    description: 'Skips current song.'
  },
  {
    name: 'pause',
    description: 'Pauses current song.'
  },
  {
    name: 'resume',
    description: 'Resumes currently paused song.'
  },
  {
    name: 'queue',
    description: 'Gets the queue.'
  },
  {
    name: 'help',
    description: "Lists Daddy Bop's commands!"
  }

];

const rest = new REST({version: '10'}). setToken(process.env.TOKEN);

(async ()=>{

  try {
    console.log(`Registering slash commands`)
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID),
        {
          body: commands
        }
    )
        console.log(`Slash commands registered!`);

  } catch (error) {
    console.log(`There was an error: ${error}`)
  }
})();
