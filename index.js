// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { joinVoiceChannel } = require('@discordjs/voice');
const { YtDlpPlugin } = require('@distube/yt-dlp'); // opcjonalnie, lepsza obsługa YouTube

// Tworzymy klienta Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Inicjalizacja DisTube (muzyka)
const distube = new DisTube(client, {
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  plugins: [new YtDlpPlugin()] // wymaga yt-dlp zainstalowanego w Railway
});

// Event: Bot gotowy
client.on('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

// Event: Wiadomość
client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Musisz wejść na kanał głosowy!');
    if (!args[0]) return message.reply('Podaj link lub nazwę utworu!');

    try {
      await distube.play(voiceChannel, args.join(' '), {
        textChannel: message.channel,
        member: message.member
      });
      message.channel.send(`🎵 Odtwarzam: **${args.join(' ')}**`);
    } catch (err) {
      console.error(err);
      message.channel.send('❌ Nie udało się odtworzyć utworu.');
    }
  }

  if (command === 'stop') {
    distube.stop(message);
    message.channel.send('⏹️ Zatrzymano muzykę!');
  }
});

// WAŻNE: token bierze się tylko z Railway Variables
const token = process.env.TOKEN;

if (!token || token.trim() === '') {
  console.error('❌ Token bota nie został ustawiony! Sprawdź Railway Variables.');
  process.exit(1); // zatrzymujemy bota jeśli token nie istnieje
}

// Logowanie bota
client.login(token);
