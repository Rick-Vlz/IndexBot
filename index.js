require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences // Añadido para manejar la presencia de usuarios
    ] 
});

const ignoredChannels = new Set(); // Guardar canales ignorados

// Función para actualizar el índice de canales en un embed
const updateChannelIndex = async (guild) => {
    const channel = guild.channels.cache.find(ch => ch.name === '「📦」indice' && ch.isTextBased());
    //const channel = guild.channels.cache.find(ch => ch.name === 'Index' && ch.isTextBased()); This is the Default one for large scale servers
    if (!channel) return;

    // Obtener categorías y canales
    const categories = guild.channels.cache.filter(ch => ch.type === 4).sort((a, b) => a.position - b.position);
    const textChannels = guild.channels.cache.filter(ch => ch.type === 0 && !ignoredChannels.has(ch.id));
    const forumChannels = guild.channels.cache.filter(ch => ch.type === 15 && !ignoredChannels.has(ch.id)); // Foros

    let description = '';

    // Añadir canales bajo sus categorías
    categories.forEach(category => {
        description += `**${category.name}**\n`;

        const channelsInCategory = textChannels.filter(ch => ch.parentId === category.id);
        const forumsInCategory = forumChannels.filter(ch => ch.parentId === category.id);

        if (channelsInCategory.size > 0 || forumsInCategory.size > 0) {
            channelsInCategory.forEach(ch => {
                description += `• [${ch.name}](https://discord.com/channels/${guild.id}/${ch.id})\n`;
            });
            forumsInCategory.forEach(ch => {
                description += `• [${ch.name}](https://discord.com/channels/${guild.id}/${ch.id})\n`;
            });
        } else {
            description += '  *No hay canales en esta categoría.*\n';
        }
    });

    // Añadir canales y foros sin categoría
    const channelsWithoutCategory = textChannels.filter(ch => !ch.parentId);
    const forumsWithoutCategory = forumChannels.filter(ch => !ch.parentId);

    if (channelsWithoutCategory.size > 0 || forumsWithoutCategory.size > 0) {
        description += '**Sin Categoría**\n';
        channelsWithoutCategory.forEach(ch => {
            description += `• [Canal de Texto: ${ch.name}](https://discord.com/channels/${guild.id}/${ch.id})\n`;
        });
        forumsWithoutCategory.forEach(ch => {
            description += `• [Foro: ${ch.name}](https://discord.com/channels/${guild.id}/${ch.id})\n`;
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('Índice de Canales')
        .setDescription(description || 'No hay canales disponibles.')
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

    if (commandName === 'unignore') {
        const channelToUnignore = options.getChannel('channel');
        if (!channelToUnignore) return interaction.reply({ content: 'Canal no válido.', ephemeral: true });

        ignoredChannels.delete(channelToUnignore.id); // Eliminar canal de la lista de ignorados
        await updateChannelIndex(guild); // Actualizar el índice con el canal des-ignorado
        interaction.reply({ content: `El canal **${channelToUnignore.name}** ya no está ignorado.`, ephemeral: true });
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

// Evento cuando se actualiza un canal
client.on('channelUpdate', (oldChannel, newChannel) => {
    updateChannelIndex(newChannel.guild);
});

// Iniciar sesión en el bot
client.login(process.env.DISCORD_TOKEN);
