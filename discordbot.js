const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Partials, WebhookClient } = require('discord.js');
const axios = require("axios");
const { generateRandomKey, generalWebhook, isValidIP } = require('./config/general');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const webHookJson = require("./config/json/test.json")
const ipAuthJson = require("./config/json/auth.json")
const bindJson = require("./config/json/bind.json")
const generateJson = require("./config/json/generate.json")
const removeJson = require("./config/json/remove.json")
const removeUserJson = require("./config/json/userremove.json")
require('dotenv').config();

const discordbot = () => {
    let userData = {};
    const id = '1237160168836300800';
    const token = 'UZtNb5aMTRBczstkMPYDlN62Ltjz4RNy7jFZsdp5QyTf4oFelVTUzN8aE2LcpWe1tjq_';
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.DirectMessages
            // ...
        ],
        'partials': [Partials.Channel]
    })

    client.once('ready', async () => {
        const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

        const commands = [
            new SlashCommandBuilder()
                .setName('auth')
                .setDescription('Start IP authorization')
                .toJSON(),
        ];

        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(
                Routes.applicationCommands(client.application.id), // Register commands globally
                { body: commands }
            );
            console.log('Successfully reloaded application (/) commands globally.');
        } catch (error) {
            console.error(error);
        }

        console.log('Bot is ready!');
    });

    client.on('messageCreate', async function (message) {
        if (!message.content.startsWith('!') || message.author.bot) return;
        const roleName = 'Admin';
        if (!message.member.roles.cache.some(role => role.name === roleName)) {
            return message.reply('You do not have the required role.');
        }
        if (message.content === '!generate') {
            userData.discord_id = ""
            // Create a button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('x')
                        .setLabel('Click me to show BL/WL options!')
                        .setStyle(ButtonStyle.Primary)
                );

            await message.reply({ content: 'Click the button to show options:', components: [row] });
        }

        if (message.content.startsWith('!destroy')) {
            // Assuming message is the Discord message object
            const messageContent = message.content;

            // Split the message content by space to separate the command and argument(s)
            const messageParts = messageContent.split(' ');
            console.log(messageParts.length)
            if (messageParts[0] === '!destroy' && messageParts.length === 2) {
                // Get the keyname from the argument (assuming it's the second part)
                const keyname = messageParts.slice(1).join(' ');
                // Now you have the keyname
                console.log('Keyname:', keyname);
                let flag = 0;
                const keyData = await axios.get("http://localhost:5000/api/getgeneratedkey");
                if (keyData.data.length > 0) {
                    keyData.data.map((item) => {
                        if (keyname === item.key) {
                            return flag = 1
                        }
                    })
                    if (flag == 1) {
                        const keytype = keyname.substring(0, 2);
                        const users = await axios.post("http://localhost:5000/api/removekey", { key: keyname }).then((data) => data.data);
                        users.map(async (item) => {
                            const user = await client.users.fetch(item.discord_id);
                            const dmChannel = await user.createDM();
                            removeUserJson.embeds[0].description = "**YOUR " + keytype + "-KEY :** \n```" + keyname + "```*is now deleted and won't work anymore*\n\n**Thanks for your support!**\n*PumpITpro team*"
                            removeUserJson.embeds[0].timestamp = new Date();
                            await dmChannel.send(removeUserJson);
                        })
                        const description = "**" + keytype + " -KEY :** \n```" + keyname + "```*deleted correctly* \n\n"
                        generalWebhook(id, token, description, removeJson)


                    }
                    else {
                        await message.reply({ content: 'Invalid key format or key is not exist', components: [] });
                    }
                }

                // You can perform further actions with the keyname, such as deleting the key
            } else {
                await message.reply({ content: 'Invalid command format ', components: [] });
                // Handle incorrect command format or no argument provided
            }

        }

        if (message.content.startsWith('!bind')) {
            // Assuming message is the Discord message object
            const messageContent = message.content;
            userData.discord_id = ""
            // Split the message content by space to separate the command and argument(s)
            const messageParts = messageContent.split(' ');
            if (messageParts[0] === '!bind' && messageParts.length === 3) {
                // Get the keyname from the argument (assuming it's the second part)
                const keyname = messageParts[1];
                const discordname = messageParts[2];
                // Now you have the keyname
                let flag = 0;
                const keyData = await axios.get("http://localhost:5000/api/getgeneratedkey");
                let expiredate;
                console.log(keyname, "keyname")
                if (keyData.data.length > 0) {
                    keyData.data.map((item) => {
                        if (item.key === keyname) {
                            expiredate = item.expire_date;
                            console.log(item, "item")
                            return flag = 1
                        }
                    })
                    if (flag == 1) {
                        const keytype = keyname.substring(0, 2);
                        userData.key = keyname;
                        userData.discord_id = discordname;
                        userData.key_type = keytype;
                        userData.expire_date = expiredate;
                        userData.checkbind = true;
                        try {
                            const user = await client.users.fetch(discordname);
                            const dmChannel = await user.createDM();
                            bindJson.embeds[0].description = "Be sure to check <#1233171215976501279> :robot: \n\n**YOUR " + keytype + " KEY :**\n```" + userData.key + "```*autodelete * <t:" + (Math.floor(new Date(expiredate).getTime() / 1000)) + ":R>\n\nLet's start print! :sleeping:"
                            bindJson.embeds[0].timestamp = new Date();
                            await dmChannel.send(bindJson);
                        } catch (error) {
                            await message.reply({ content: 'User is not exist', components: [] });
                        }
                        await axios.post("http://localhost:5000/api/adduser", { key: keyname, checkbind: true }).then((data) => console.log("data")).catch((err) => console.log(err));
                        console.log(userData, "userData")
                        await axios.post("http://localhost:5000/api/adduser", userData);
                        await message.reply({ content: 'Bind.. Sent', components: [] });

                    }
                    else {
                        // You can perform further actions with the keyname, such as deleting the key
                        await message.reply({ content: 'Invalid key format ', components: [] });
                    }
                }

            } else {
                await message.reply({ content: 'Invalid command format ', components: [] });
                // Handle incorrect command format or no argument provided
            }

        }

        if (message.content === '!overview') {
            // Create a button
            const keyData = await axios.post("http://localhost:5000/api/getavailableusers");
            console.log(keyData.data)
            let description = "\n\n";
            if (keyData.data.length > 0) {
                keyData.data.map(async (item) => {
                    description += "**YOUR " + item.key_type + " KEY :**\n```" + item.key + "```*autodelete * <t:" + (Math.floor(new Date(item.expire_date).getTime() / 1000)) + ":R> \n*binded ip :* " + item.ip_address + " \n\n"
                })
                description += "Let's start print! :sleeping:";
                generalWebhook(id, token, description, bindJson)
            }

        }
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'x') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('BL')
                        .setLabel('BL Key')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('WL')
                        .setLabel('WL Key')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.update({ content: 'Choose an option:', components: [row] });
        } else if (interaction.customId === 'BL' || interaction.customId === 'WL') {
            // Handle the logic for BL or WL key generation or whatever the button is supposed to do
            userData.key_type = interaction.customId;
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('3')
                        .setLabel('3 hour')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('24')
                        .setLabel('24 hour')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('72')
                        .setLabel('3 days')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('100000')
                        .setLabel('lifetime')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ content: 'Choose an option:', components: [row] });

        } else if (interaction.customId === "3" || interaction.customId === "24" || interaction.customId === "72" || interaction.customId === "100000") {
            const key = generateRandomKey(userData.key_type);
            userData.key = key;
            userData.expire_time = Number(interaction.customId) * 60 * 60 * 1000;
            console.log(Math.floor(new Date(Date.now() + userData.expire_time).getTime() / 1000))
            await axios.post("http://localhost:5000/api/adduser", userData).then((data) => console.log(data)).catch((err) => console.log(err));
            description = "**" + userData.key_type + "-KEY :** \n```" + userData.key + "```*autodelete * <t:" + (Math.floor(new Date(Date.now() + userData.expire_time).getTime() / 1000)) + ":R>"
            generalWebhook(id, token, description, generateJson)
            await interaction.update({ content: 'Created', components: [] });
        }
    });
    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const data = await axios.get("http://localhost:5000/api/users");
        let flag = 0;
        data.data.map((item) => {
            if (item.discord_id === interaction.user.id) {
                flag = 1
            }
        })
        if (interaction.commandName === 'auth' && interaction.channel.type === 1 && flag === 1) {
            userData.discord_id = interaction.user.id;
            const modal = new ModalBuilder()
                .setCustomId('ipAuthorization')
                .setTitle('IP Authorization')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('ipInput')
                            .setLabel("Enter your IP address")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }
        if (flag === 0) {
            return await interaction.reply("Your Key is Expired or Destroyed");
        }
    });
    client.on('interactionCreate', async interaction => {
        if (interaction.isModalSubmit() && interaction.customId === 'ipAuthorization') {
            const ipAddress = interaction.fields.getTextInputValue('ipInput');
            if (!isValidIP(ipAddress)) {
                // await interaction.followUp(`Invalid IP address.Please enter a valid IP address.${ ipAddress } `);
                interaction.channel.send({ content: 'Invalid IP address. Please enter a valid IP address.', components: [] });
                return;
            }
            userData.ip_address = ipAddress;
            ipAuthJson.embeds[0].description = `:green_square: ** green light for  :  ${ipAddress}** `
            ipAuthJson.embeds[0].timestamp = new Date();
            const description1 = `:green_square: ** green light for  :  ${ipAddress}** `
            generalWebhook(id, token, description1, ipAuthJson)
            await interaction.reply(ipAuthJson);
            console.log(interaction.user)
            console.log(userData)
            await axios.post("http://localhost:5000/api/adduser", userData).then((data) => console.log("data")).catch((err) => console.log(err));
        }
    });
    client.login(process.env.CLIENT_TOKEN);

}
module.exports = discordbot;