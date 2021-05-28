// Extract the required classes from the discord.js module
const { Client, MessageEmbed } = require('discord.js');
require("./ExtendedMessage");

// Create an instance of a Discord client
const client = new Client();

const request = require("request-promise");

var tools = require('./tools');
var presence = require('./presence');

var sendAddressInfo = require('./handler/account');
var sendBlockInfo = require('./handler/block');
var sendRepInfo = require('./handler/representative');
var sendBlocks = require('./handler/blockcounts');
var sendConvert = require('./handler/convert');
var sendBlocksPerSecond = require('./handler/cps');
var sendBacklog = require('./handler/backlog');

// client init

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  presence.updatePresence(client);
  setInterval(() => {presence.updatePresence(client)}, 30 * 1000)
});

client.on('message', msg => {
  // Do not react to own messages
  if (msg.author.id == client.user.id) {
    return;
  }

  // Split to array
  var msgarray = msg.content.split(" ");

  if (msg.content === '.blocks') {
    sendBlocks(client, msg.channel)

  } else if (msgarray[0] === '.tps' || msgarray[0] === '.bps' || msgarray[0] === '.cps') {
    sendBlocksPerSecond(client, msg.author)

  } else if (msgarray[0] === '.backlog') {
    sendBacklog(client, msg.channel)

  } else if (msgarray[0] === '.account') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the account address!');
      return;
    }

    sendAddressInfo(client, msg.channel, msgarray[1])

  } else if (msgarray[0] === '.rep') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the account address!');
      return;
    }

    sendRepInfo(client, msg.channel, msgarray[1]);

  } else if (msgarray[0] === '.convert' || msgarray[0] === '.calc') {
    if (typeof msgarray[1] === 'undefined') {
      msg.inlineReply('please add the amount!');
      return;
    }

    if (typeof msgarray[2] === 'undefined') {
      var unit = 'NANO';
    } else {
      var unit = msgarray[2];
    }

    sendConvert(client, msg.channel, msgarray[1], unit);

  } else if (msg.content === '.ledger') {
    // ledger fastsync download
    msg.reply('use this link to download the official ledger from Yandex Disk: https://mynano.ninja/api/ledger/download\n' +
    '```bash\n' +
    'wget "https://mynano.ninja/api/ledger/download" -O ledger.7z' +
    '```');

  } else if (msg.content === '.trade' || msg.content === '.trading') {
    const embed = new MessageEmbed()
      .setColor(0xFF0000)
      .setDescription('For trade talk please visit one of the servers below:')
      .addField('NanoTrade', '[Join server](https://bit.ly/nanotrade-discord)', true)
      .addField('The Nano Center', '[Join server](https://bit.ly/nanocenter-discord)', true)
      .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)

    // Send the embed to the same channel as the message
    msg.channel.send(embed);

  } else if (msg.content === '.nanotrade') {
    // trade talk
    msg.reply('https://bit.ly/nanotrade-discord **UNOFFICIAL NANO TRADE DISCORD**');

  } else if (msg.content === '.tnc') {
    // trade talk
    msg.reply('join the TNC Discord server at https://bit.ly/nanocenter-discord');

  } else if (msg.content === '.wallet' || msg.content === '.wallets') {

    const embed = new MessageEmbed()
      .setTitle('Unofficial Wallet List')
      .setColor(0xFF0000)
      .setDescription('[Open Complete List](https://nanowallets.guide)')
      .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
      .addField('Nault', '_Web, Windows, Mac, Linux_\n[Visit website](https://nault.cc)', true)
      .addField('Natrium', '_Android, iOS_\n[Visit website](https://natrium.io)', true)
      .addField('Trust Wallet', '_Android, iOS_\n[Visit website](https://trustwallet.com/de/nano-wallet/)', true)
      .addField('Exodus', '_Windows, Mac, Linux, \nAndroid, iOS_\n[Visit website](https://www.exodus.io/)', true)
      .addField('Guarda', '_Windows, Mac, Linux, \nWeb, Android, iOS_\n[Visit website](https://guarda.com)', true)
      .addField('Vola', '_iOS_\n[Visit website](https://getvola.com)', true)
      .addField('Nalli', '_Android, iOS_\n[Visit website](https://nalli.app)', true)
      .addField('Nanollet', '_Windows, Mac, Linux_\n[Visit website](https://nanollet.org)', true)
      .addField('WeNano', '_iOS_\n[Visit website](https://wenano.net)', true)

    // Send the embed to the same channel as the message
    msg.channel.send(embed);

  } else if (tools.hasAddress(msg.content) || tools.hasBlockHash(msg.content)) {
    const emoji = '🔎';
    msg.react(emoji);
    const filter = (reaction, user) => reaction.emoji.name === emoji && user.id !== client.user.id;
    const collector = msg.createReactionCollector(filter, { time: 60 * 60 * 1000 });
    collector.on('collect', handleReaction);

  } else if (msg.content === '.invite') {
    // bot invite
    msg.reply('https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=0')

  } else if (msg.content === '.servers' && msg.author.id === '127749400523964416') {
    var guilds = client.guilds.cache.map((guild) => {
      return guild.name;
    })

    msg.reply(guilds.join(', '))

  } else if (msg.content === '.help') {
    // help text
    msg.author.send("**Available commands**\n\n" +
      "`.blocks` - Current block count\n\n" +
      "`.cps` - Current confirmations per second\n\n" +
      "`.tps` - Current transactions per second\n\n" +
      "`.account ADDRESS` - Information about an account\n\n" +
      "`.rep ADDRESS` - Information about a representative\n\n" +
      "`.ledger` - Ledger download URL\n\n" +
      "`.fastsync` - Tutorial on fast sync\n\n" +
      "`.trade` - Invite to the trade channel\n\n" +
      "`.wallets` - Shows the unofficial wallet list\n\n" +
      "`.invite` - Get the invite link\n\n" +
      "`.help` - Shows this text\n\n\n" +
      "This bot is open source: https://github.com/BitDesert/MyNanoNinja-Discord-Bot \n\n" + 
      "Sponsor the development at https://github.com/sponsors/BitDesert");

  }
});

async function handleReaction(reaction, user){
  console.log(`Collected ${reaction.emoji.name}`, reaction.message.content)

  if(tools.hasAddress(reaction.message.content)){
    const address = tools.getAddress(reaction.message.content)[1];
    sendAddressInfo(client, user, address);
  } else if(tools.hasBlockHash(reaction.message.content)){
    const blockhash = tools.getBlockHash(reaction.message.content)[1];
    sendBlockInfo(client, user, blockhash);
  }
}

client.login(process.env.TOKEN);
