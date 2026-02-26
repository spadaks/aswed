
const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const distube = new DisTube(client);

client.on('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(" ");
  const cmd = args.shift();

  if (cmd === "play") {
    if (!message.member.voice.channel)
      return message.reply("Wejdź na kanał!");

    distube.play(message.member.voice.channel, args.join(" "), {
      textChannel: message.channel,
      member: message.member
    });
  }

  if (cmd === "stop") {
    distube.stop(message);
    message.channel.send("⏹️ Stop");
  }
});

client.login(process.env.TOKEN);