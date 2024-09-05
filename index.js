require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(3000, () => console.log('Server is running'));

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Función para actualizar el índice de canales
const updateChannelIndex = async (guild) => {
    const channel = guild.channels.cache.find(ch => ch.name === 'indice-canales' && ch.isTextBased());
    if (!channel) return;
    
    const channelList = guild.channels.cache
        .filter(ch => ch.type === 0) // Solo canales de texto
        .map(ch => `${ch.name}`).join('\n');

    const message = `**Índice de Canales:**\n${channelList}`;
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    
    if (lastMessage) {
        await lastMessage.edit(message);
    } else {
        await channel.send(message);
    }
};

// Evento cuando el bot está listo
client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    client.guilds.cache.forEach(guild => updateChannelIndex(guild));
});

// Evento cuando se crea un canal
client.on('channelCreate', (channel) => {
    updateChannelIndex(channel.guild);
});

// Evento cuando se elimina un canal
client.on('channelDelete', (channel) => {
    updateChannelIndex(channel.guild);
});

// Iniciar sesión en el bot
client.login(process.env.DISCORD_TOKEN);
