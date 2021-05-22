// Extract the required classes from the discord.js module
const { Client, MessageEmbed } = require('discord.js');

// Create an instance of a Discord client
const client = new Client();

const request = require("request-promise");
var moment = require('moment');
const Big = require('big.js');

// client init

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  updatePresence();
});

client.on('message', msg => {
  // Do not react to own messages
  if (msg.author.id == client.user.id) {
    return;
  }

  // Split to array
  var msgarray = msg.content.split(" ");

  if (msg.content === '.blocks') {
    request({
      url: 'https://mynano.ninja/api/blockcount',
      json: true
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        msg.reply('API error.');
        return;
      } else if (response.statusCode == 404) {
        msg.reply(body.error);
      } else if (response.statusCode == 200) {
        // return blockcount
        msg.channel.send({
          embed: {
            color: 16007990,
            fields: [
              {
                name: "Blocks",
                value: parseInt(body.count).toLocaleString('en-US'),
                inline: true
              }
            ],
            footer: {
              icon_url: client.user.avatarURL,
              text: 'My Nano Ninja | mynano.ninja'
            }
          }
        });
      }
    });

  } else if (msgarray[0] === '.tps') {

    sendTPS(msg);

  } else if (msgarray[0] === '.cps') {

    //sendCPS(msg);

  } else if (msgarray[0] === '.account') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the account address!');
      return;
    }

    var account = msgarray[1]

    // get account
    request({
      url: 'https://api.nanocrawler.cc/account/' + account,
      json: true
    }, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        msg.reply('API error.');
        return;
      } else if (response.statusCode == 400) {
        msg.reply(body.error);
      } else if (response.statusCode == 200) {
        msg.channel.send({
          embed: {
            color: 16007990,
            author: {
              name: account,
              url: 'https://nanocrawler.cc/explorer/account/' + account
            },
            fields: [
              {
                name: "Balance",
                value: body.account.balance + ' NANO',
                inline: true
              },
              {
                name: "Pending",
                value: body.account.pending + ' NANO',
                inline: true
              }
            ],
            footer: {
              icon_url: client.user.avatarURL,
              text: 'My Nano Ninja | mynano.ninja'
            }
          }
        });

      }

    });

  } else if (msgarray[0] === '.rep') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the account address!');
      return;
    }

    // get account
    request({
      url: 'https://mynano.ninja/api/accounts/' + msgarray[1],
      json: true
    }, function (error, response, body) {
      if (error) {
        return msg.reply('API error.');
      }

      if (response.statusCode == 404) {
        msg.reply(body.error);
      } else if (response.statusCode !== 200) {
        msg.reply('API error.');
      } else if (response.statusCode == 200) {
        msg.channel.send({
          embed: {
            color: 16007990,
            author: {
              name: body.account,
              url: 'https://mynano.ninja/account/' + body.account
            },
            fields: [
              {
                name: "Voting Weight",
                value: toLocaleString(variableRound(rawtoNANO(body.votingweight))) + ' NANO',
                inline: true
              },
              {
                name: "Uptime",
                value: round(body.uptime, 3) + ' %',
                inline: true
              },
              {
                name: "Last voted",
                value: moment(body.lastVoted).fromNow(),
                inline: true
              }
            ],
            footer: {
              icon_url: client.user.avatarURL,
              text: 'My Nano Ninja | mynano.ninja'
            }
          }
        });

      }

    });

  } else if (msgarray[0] === '.convert' || msgarray[0] === '.calc') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the amount!');
      return;
    }

    // based on https://nanoo.tools/unit-converter

    var inputBig = Big(msgarray[1]);

    if (typeof msgarray[2] === 'undefined') {
      var unit = 'NANO';
    } else {
      var unit = msgarray[2];
    }

    // define multipliers/dividers. dividers will be implemented as multipliers for precision reasons. 
    multMnano = Big('1000000000000000000000000000000'); // 10^30
    divMnano = Big('0.000000000000000000000000000001'); // 10^-30
    multknano = Big('1000000000000000000000000000'); // 10^27
    divknano = Big('0.000000000000000000000000001'); // 10^-27
    multnano = Big('1000000000000000000000000'); // 10^24
    divnano = Big('0.000000000000000000000001'); // 10^-24

    // Convert input to raw amount
    if (unit == "NANO") {
      var raw = Big(inputBig.times(multMnano));
    } else if (unit == "knano") {
      var raw = Big(inputBig.times(multknano));
    } else if (unit == "nano") {
      var raw = Big(inputBig.times(multnano));
    } else if (unit == "raw") {
      var raw = Big(inputBig);
    } else {
      msg.reply('unit is not known!');
      return;
    }

    msg.channel.send({
      embed: {
        color: 16007990,
        fields: [
          {
            name: "NANO",
            value: Big(raw.times(divMnano)).toFixed().toString(),
            inline: true
          },
          {
            name: "knano",
            value: Big(raw.times(divknano)).toFixed().toString(),
            inline: true
          },
          {
            name: "nano",
            value: Big(raw.times(divnano)).toFixed().toString(),
            inline: true
          },
          {
            name: "raw",
            value: raw.toFixed().toString(),
            inline: true
          },
          {
            name: "raw Hex",
            value: pad16bytehex(dec2hex(raw.toFixed().toString())).toUpperCase(),
            inline: true
          }
        ],
        footer: {
          icon_url: client.user.avatarURL,
          text: 'My Nano Ninja | mynano.ninja'
        }
      }
    });

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

  } else if (msg.content === '.invite') {
    // bot invite
    msg.reply('https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=0')

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
      "`.help` - Shows this text\n\n");

  }
});

async function sendTPS(msg) {
  var result_1m = await request({
    url: 'https://api.nanocrawler.cc/tps/1m',
    json: true
  });

  var result_5m = await request({
    url: 'https://api.nanocrawler.cc/tps/5m',
    json: true
  });

  var result_15m = await request({
    url: 'https://api.nanocrawler.cc/tps/15m',
    json: true
  });

  var result_30m = await request({
    url: 'https://api.nanocrawler.cc/tps/30m',
    json: true
  });

  var result_1hr = await request({
    url: 'https://api.nanocrawler.cc/tps/1hr',
    json: true
  });

  var result_24hr = await request({
    url: 'https://api.nanocrawler.cc/tps/24hr',
    json: true
  });

  const embed = new MessageEmbed()
    .setTitle('TPS')
    .setColor(0xFF0000)
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .setDescription(
      '**1m:** ' + formatTPS(result_1m.tps) + ' / ' +
      '**5m:** ' + formatTPS(result_5m.tps) + ' / ' +
      '**15m:** ' + formatTPS(result_15m.tps) + ' / ' +
      '**30m:** ' + formatTPS(result_30m.tps) + ' / ' +
      '**1hr** ' + formatTPS(result_1hr.tps) + ' / ' +
      '**24hr:** ' + formatTPS(result_24hr.tps)
    )

  // Send the embed to the same channel as the message
  msg.channel.send(embed);

}

async function sendCPS(msg) {
  var result = await request({
    url: 'https://nanoticker.info/json/stats.json',
    json: true
  });

  const embed = new MessageEmbed()
    .setTitle('CPS')
    .setColor(0xFF0000)
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .setDescription(formatTPS(result.CPSMedian_pr))

  // Send the embed to the same channel as the message
  msg.channel.send(embed);

}

async function updatePresence() {
  var presence = '';

  try {
    var result = await request({
      url: 'https://nanoticker.info/json/stats.json',
      json: true
    });
    presence = formatTPS(result.CPSMedian_pr) + ' CPS | ' + formatTPS(result.BPSMedian_pr) + ' BPS | .help'
  } catch (error) {
    console.log('Cannot catch current CPS'); 
  }

  client.user.setActivity(presence, { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);

}
setInterval(updatePresence, 60 * 1000)

function formatTPS(tps) {
  return parseFloat(tps).toFixed(2).toLocaleString('en-US');
}

function rawtoNANO(raw) {
  return raw / 1000000000000000000000000000000;
}

function toLocaleString(value) {
  if(isNaN(value)) return '0';
  return Number.parseFloat(value).toLocaleString('en-US')
}

function variableRound(value) {
  if (value > 1) {
    return round(value, 2);
  } else {
    return round(value, 5);
  }
}

function round(value, precision) {
  if (Number.isInteger(precision)) {
    var shift = Math.pow(10, precision);
    return Math.round(value * shift) / shift;
  } else {
    return Math.round(value);
  }
}

// Zerofill HEX ... modified https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
function pad16bytehex(n) {
  var pad = '00000000000000000000000000000000'
  return (pad + n).slice(-pad.length);
}

function dec2hex(str, bytes = null) {
  var dec = str.toString().split(''), sum = [], hex = [], i, s
  while (dec.length) {
    s = 1 * dec.shift()
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10
      sum[i] = s % 16
      s = (s - sum[i]) / 16
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16));
  }

  hex = hex.join('');

  if (hex.length % 2 != 0)
    hex = "0" + hex;

  if (bytes > hex.length / 2) {
    var diff = bytes - hex.length / 2;
    for (var i = 0; i < diff; i++)
      hex = "00" + hex;
  }

  return hex;
}

client.login(process.env.TOKEN);
