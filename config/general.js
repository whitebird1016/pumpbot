const { WebhookClient } = require("discord.js");

const generateRandomKey = (currentId) => {
    // Implement your key generation logic here (e.g., using random characters)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 20;
    let key = '';
    for (let i = 0; i < length; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return currentId + "-" + key;
}

const generalWebhook = (id, token, description, json) => {
    const webhookClient = new WebhookClient({ id: id, token: token });
    json.embeds[0].description = description
    json.embeds[0].timestamp = new Date();
    webhookClient.send(json)
        .then(() => console.log("Message sent Successfully"))
        .catch(console.error);
}

const isValidIPv4 = (ip) => {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (!ipv4Regex.test(ip)) return false;
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
}

const isValidIPv6 = (ip) => {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4})$/;
    return ipv6Regex.test(ip);
}

const isValidIP = (ip) => {
    return isValidIPv4(ip) || isValidIPv6(ip);
}
module.exports = { generateRandomKey, generalWebhook, isValidIP }