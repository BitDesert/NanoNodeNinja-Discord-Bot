const Discord = require('discord.js');
const client = new Discord.Client();

const {Nano} = require('nanode')
const nano = new Nano({url: 'http://[::1]:7076'})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '.blocks') {
    nano.rpc('block_count').then((data) => {
      msg.reply(data.count + ' blocks');
    })
  }
});

client.login(process.env.TOKEN);