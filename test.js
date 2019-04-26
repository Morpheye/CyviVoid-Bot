const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
const PREFIX = '?';
const workcooldown = new Set();

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () => {
	const storedBalances = await Users.findAll();
storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (message.author.bot) return;
	currency.add(message.author.id, 1);

	if (!message.content.startsWith(PREFIX)) return;
	const input = message.content.slice(PREFIX.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance' || command === 'bal') {


		const target = message.mentions.users.first() || message.author;
return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)}??`);
	} else if (command === 'work') {


    if (workcooldown.has(msg.author.id)) {
            msg.channel.send("Wait 1 minute before getting typing this again. - " + msg.author);
    } else {

           // the user can type the command ... your command code goes here :)

        // Adds the user to the set so that they can't talk for a minute
        workcooldown.add(msg.author.id);
        setTimeout(() => {
          // Removes the user from the set after a minute
          workcooldown.delete(msg.author.id);
        }, 60000);
    }


}

	} else if (command === 'inventory') {
		const target = message.mentions.users.first() || message.author;
const user = await Users.findByPrimary(target.id);
const items = await user.getItems();

if (!items.length) return message.channel.send(`${target.tag} has nothing!`);
return message.channel.send(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);


	} else if (command === 'transfer') {


		const currentAmount = currency.getBalance(message.author.id);
const transferAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
const transferTarget = message.mentions.users.first();

if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author}, you only have ${currentAmount}.`);
if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

currency.add(message.author.id, -transferAmount);
currency.add(transferTarget.id, transferAmount);

return message.channel.send(`Successfully transferred ${transferAmount} to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}`);


	} else if (command === 'buy') {


		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
if (!item) return message.channel.send(`That item doesn't exist.`);
if (item.cost > currency.getBalance(message.author.id)) {
	return message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
}

const user = await Users.findByPrimary(message.author.id);
currency.add(message.author.id, -item.cost);
await user.addItem(item);

message.channel.send(`You've bought: ${item.name}.`);


	} else if (command === 'shop') {


		const items = await CurrencyShop.findAll();
return message.channel.send('Shop\n' + items.map(item => `${item.name}: ${item.cost}`).join('\n'), { code: true });


	} else if (command === 'leaderboard' || command === 'lb') {


		return message.channel.send(
	currency.sort((a, b) => b.balance - a.balance)
		.filter(user => client.users.has(user.user_id))
		.first(10)
		.map((user, position) => `(${position + 1}) ${(client.users.get(user.user_id).tag)}: ${user.balance}`)
		.join('\n'),
	{ code: true }
);
	}
});

client.login('NTMzMTM4Njg2NTUzMDk2MjEy.Dxmrsg.0S1hMKlqoZkPYmFRiIdNnq7peV4');