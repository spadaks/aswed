// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const ffmpegPath = require('ffmpeg-static'); // FFMPEG dla Railway

// Klient Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// DisTube konfiguracja
const distube = new DisTube(client, {
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  ffmpeg: ffmpegPath, // ustawiamy FFMPEG
  plugins: [new YtDlpPlugin()] // obsługa YouTube
});

// Bot gotowy
client.on('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

// Komendy
client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const voiceChannel = message.member.voice.channel;

  if (command === 'play') {
    if (!voiceChannel) return message.reply('Musisz wejść na kanał głosowy!');
    if (!args[0]) return message.reply('Podaj link lub nazwę utworu!');

    try {
      await distube.play(voiceChannel, args.join(' '), {
        textChannel: message.channel,
        member: message.member
      });
    } catch (err) {
      console.error(err);
      message.channel.send('❌ Nie udało się odtworzyć utworu.');
    }
  }

  if (command === 'stop') {
    distube.stop(message);
    message.channel.send('⏹️ Zatrzymano muzykę!');
  }

  if (command === 'skip') {
    try {
      distube.skip(message);
      message.channel.send('⏭️ Pomiń utwór!');
    } catch (err) {
      console.error(err);
      message.channel.send('❌ Nie udało się pominąć utworu.');
    }
  }

  if (command === 'queue') {
    const queue = distube.getQueue(message);
    if (!queue) return message.channel.send('❌ Kolejka jest pusta!');
    const q = queue.songs.map((song, i) => `${i+1}. ${song.name}`).join('\n');
    message.channel.send(`🎶 Kolejka:\n${q}`);
  }
});

// Logi DisTube
distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`🎶 Odtwarzam: **${song.name}**`);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`➕ Dodano do kolejki: **${song.name}**`);
  })
  .on('error', (channel, e) => {
    console.error(e);
    if(channel) channel.send(`❌ Błąd: ${e}`);
  });

// Token z Railway Variables
const token = process.env.TOKEN;

if (!token || token.trim() === '') {
  console.error('❌ Token bota nie został ustawiony! Sprawdź Railway Variables.');
  process.exit(1);
}

// Logowanie bota
client.login(token);
