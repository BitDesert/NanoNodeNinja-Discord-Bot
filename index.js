const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');
const {
  nanoPrettify
} = require('nano-prettify')
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
            fields: [{
              name: "Blocks",
              value: parseInt(body.count).toLocaleString('en-US'),
              inline: true
            }],
            footer: {
              icon_url: client.user.avatarURL,
              text: 'My Nano Ninja'
            }
          }
        });
      }
    });

  } else if (msgarray[0] === '.account') {
    if (typeof msgarray[1] === 'undefined') {
      msg.reply('please add the account address!');
      return;
    }

    // get account
    request({
      url: 'https://nano-api.meltingice.net/account/' + msgarray[1],
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
              name: msgarray[1],
              url: 'https://nano.meltingice.net/explorer/account/' + msgarray[1]
            },
            fields: [{
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
              text: 'My Nano Ninja'
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
      if (error || response.statusCode !== 200) {
        msg.reply('API error.');
        return;
      } else if (response.statusCode == 404) {
        msg.reply(body.error);
      } else if (response.statusCode == 200) {
        msg.channel.send({
          embed: {
            color: 16007990,
            author: {
              name: body.account,
              url: 'https://mynano.ninja/account/' + body.account
            },
            fields: [{
              name: "Voting Weight",
              value: variableRound(rawtoNANO(body.votingweight)) + ' NANO',
              inline: true
            },
            {
              name: "Delegators",
              value: body.delegators,
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
              text: 'My Nano Ninja'
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
        fields: [{
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
          text: 'My Nano Ninja'
        }
      }
    });

  } else if (msg.content === '.ledger') {
    // ledger fastsync download
    msg.reply('https://mynano.ninja/api/ledger/download');

  } else if (msg.content === '.trade' || msg.content === '.trading') {
    // trade talk
    msg.reply('for trade talk please visit https://discord.gg/fUw6fWc');

  } else if (msg.content === '.tnc') {
    // trade talk
    msg.reply('join the TNC Discord server at https://discord.gg/fUw6fWc');

  } else if (msg.content === '.wallet' || msg.content === '.wallets') {
    // trade talk
    msg.reply(
      'unofficial wallet list:\n' +
      '**NanoVault:**\n' +
      '_Web, Windows, OSX, Linux_\n' +
      '<https://nanovault.io/> | <https://github.com/cronoh/nanovault/releases>\n\n' +
      '**Canoe:**\n' +
      '_Windows, OSX, Linux, iOS, Android_\n' +
      '<https://getcanoe.io/download/>\n\n' +
      '**Nano Wallet Company (NWC)**\n' +
      '_Windows, OSX, Linux, iOS, Android_\n' +
      '<https://nanowalletcompany.com>'
    );

  } else if (msg.content === '.fastsync') {
    // fastsync tutorial
    msg.reply('https://nanotools.github.io/easy-nano-node/manual/ubuntu.html#fast-sync');

  } else if (msg.content === '.invite') {
    // bot invite
    msg.reply('https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=0')

  } else if (msg.content === '.help') {
    // help text
    msg.author.send("**Available commands**\n\n" +
      "`.blocks` - Current block count\n\n" +
      "`.account ADDRESS` - Information about an account\n\n" +
      "`.rep ADDRESS` - Information about a representative\n\n" +
      "`.ledger` - Ledger download URL\n\n" +
      "`.fastsync` - Tutorial on fast sync\n\n" +
      "`.invite` - Get the invite link\n\n" +
      "`.help` - Shows this text\n\n");

  }
});

function updatePresence() {
  request({
    url: 'https://mynano.ninja/api/blockcount',
    json: true
  }, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      return;
    } else if (response.statusCode == 200) {
      // Set the client user's presence
      client.user.setPresence({ game: { name: parseInt(body.count).toLocaleString('en-US') + ' Blocks' }, status: 'idle' })
        .then(console.log)
        .catch(console.error);
    }
  });

}
setInterval(updatePresence, 60 * 1000)

function rawtoNANO(raw) {
  return raw / 1000000000000000000000000000000;
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
