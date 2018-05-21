const Discord = require('discord.js');
const client = new Discord.Client();

const {
  Nano
} = require('nanode')
const nano = new Nano({
  url: 'http://[::1]:7076'
})

var request = require('request');
const {
  nanoPrettify
} = require('nano-prettify')
var moment = require('moment');

// client init

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  // Do not react to own messages
  if (msg.author.id == client.user.id) {
    return;
  }

  // Split to array
  var msgarray = msg.content.split(" ");

  if (msg.content === '.blocks') {
    // block count
    nano.rpc('block_count').then((data) => {
      msg.channel.send({
        embed: {
          color: 16007990,
          fields: [{
            name: "Blocks",
            value: parseInt(data.count).toLocaleString('en-US'),
            inline: true
          }],
          footer: {
            icon_url: client.user.avatarURL,
            text: 'Nano Node Ninja'
          }
        }
      });
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
              text: 'Nano Node Ninja'
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
      url: 'https://nanonode.ninja/api/accounts/' + msgarray[1],
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
              url: 'https://nanonode.ninja/account/' + body.account
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
              text: 'Nano Node Ninja'
            }
          }
        });

      }

    });

  } else if (msg.content === '.invite') {
    // bot invite
    msg.reply('https://discordapp.com/oauth2/authorize?client_id=' + client.user.id + '&scope=bot&permissions=0')

  } else if (msg.content === '.help') {
    // help text
    msg.author.send("**Available commands**\n\n" +
      "`.blocks` - Current block count\n\n" +
      "`.account ADDRESS` - Information about an account\n\n" +
      "`.invite` - Get the invite link\n\n");

  }
});

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


client.login(process.env.TOKEN);