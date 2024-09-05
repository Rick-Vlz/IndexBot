const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'ignore',
        description: 'Ignora un canal para que no aparezca en el índice',
        options: [
            {
                name: 'channel',
                type: 7, // Tipo para canal
                description: 'Elige el canal a ignorar',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registrando comandos...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Comandos registrados con éxito.');
    } catch (error) {
        console.error(error);
    }
})();
