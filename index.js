require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const ignoredChannels = new Set(); // Guardar canales ignorados

// Función para actualizar el índice de canales en un embed
const updateChannelIndex = async (guild) => {
    const channel = guild.channels.cache.find(ch => ch.name === '「📦」indice' && ch.isTextBased());
    if (!channel) return;

    // Generar la lista de canales, excluyendo los ignorados
    const channelList = guild.channels.cache
        .filter(ch => ch.type === 0 && !ignoredChannels.has(ch.id)) // Filtrar solo canales de texto no ignorados
        .map(ch => `• [${ch.name}](https://discord.com/channels/${guild.id}/${ch.id})`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setTitle('Índice de Canales')
        .setDescription(channelList || 'No hay canales disponibles.')
        .setColor(0x00AE86);

    // Obtener el último mensaje del canal "indice-canales"
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();

    // Editar el último mensaje si existe, o enviar uno nuevo
    if (lastMessage) {
        await lastMessage.edit({ embeds: [embed] });
    } else {
        await channel.send({ embeds: [embed] });
    }
};

// Comando para ignorar un canal
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild } = interaction;

    if (commandName === 'ignore') {
        const channelToIgnore = options.getChannel('channel');
        if (!channelToIgnore) return interaction.reply({ content: 'Canal no válido.', ephemeral: true });

        ignoredChannels.add(channelToIgnore.id); // Añadir canal a la lista de ignorados
        await updateChannelIndex(guild); // Actualizar el índice sin el canal ignorado
        interaction.reply({ content: `El canal **${channelToIgnore.name}** ha sido ignorado.`, ephemeral: true });
    }
});

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
