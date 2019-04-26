const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
const PREFIX = '?';
const workCooldown = new Set();
const begCooldown = new Set();
const crimeCooldown = new Set();

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

currency() = new currency();

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

    if (workCooldown.has(message.author.id)) {
            message.channel.send("Wait 60 seconds before doing this again speedy");
    } else {
	var workamount = 30 + Math.floor(Math.random() * 51);
           currency.add(message.author.id, workamount);
	   message.channel.send("You earned " + workamount + " coins.");

        // Adds the user to the set so that they can't talk for a minute
        workCooldown.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after a minute
          workCooldown.delete(message.author.id);
        }, 60000);
    }

	} else if (command === 'beg') {

    if (begCooldown.has(message.author.id)) {
            message.channel.send("Wait 30 seconds before doing this again speedy");
    } else {
	var begsuccess = Math.floor(Math.random() * 2);
	var begamount = 1 + Math.floor(Math.random() * 20);
    if (begsuccess == 1) { 
           currency.add(message.author.id, begamount);
	   message.channel.send("You earned " + begamount + " coins.");
	} else { 

	message.channel.send("Nobody donated to you get rekt");
}
        begCooldown.add(message.author.id);
        setTimeout(() => {
          begCooldown.delete(message.author.id);
        }, 30000);
    }
	} else if (command === 'crime') {

    if (crimeCooldown.has(message.author.id)) {
            message.channel.send("Wait two minutes before doing this again speedy");
    } else {
	var crimesuccess = Math.floor(Math.random() * 2);
    if (crimesuccess == 1) { 
	var crimeamount = 50 + Math.floor(Math.random() * 101);
           currency.add(message.author.id, crimeamount);
	   message.channel.send("You earned " + crimeamount + " coins.");
	} else { 
	var crimeamount = 20 + Math.floor(Math.random() * 31);
	message.channel.send("You got caught and lost " + (crimeamount) + " coins get rekt");
	currency.add(message.author.id, -crimeamount);
}
        crimeCooldown.add(message.author.id);
        setTimeout(() => {
          crimeCooldown.delete(message.author.id);
        }, 120000);
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

client.login('REEEENOTOKENTOSEEHERELMAOGETREKTSCRUB');