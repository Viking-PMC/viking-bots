import 'reflect-metadata';
import {
  Client,
  GatewayIntentBits,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import 'dotenv/config';
import { handleChatInputCommand } from './handlers/chatInputCommand';
import { handleButtonInteraction } from './handlers/buttonInteraction';
import { AppDataSource } from './typeorm';
import { ticketSetupCommand } from './commands/tickets';
import { welcomeCommand } from './commands/welcome';
import { demoteCommand, promoteCommand, rolesCommand } from './commands/roles';
import { handleContextMenuInteraction } from './handlers/contextMenuInteraction';
import {
  applicationSetupCommand,
  denyApplicationCommand,
} from './commands/Applications';
import { Ticket } from './typeorm/entities/Ticket';
import { Application } from './typeorm/entities/Application';
import { TicketMessage } from './typeorm/entities/TicketMessage';
import { ApplicationMessage } from './typeorm/entities/ApplicationMessage';

const ticketRepository = AppDataSource.getRepository(Ticket);
const applicationRepository = AppDataSource.getRepository(Application);
const ticketMessageRepository = AppDataSource.getRepository(TicketMessage);
const applicationMessageRepository =
  AppDataSource.getRepository(ApplicationMessage);

const { CLIENT_ID, GUILD_ID, BOT_TOKEN } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN!); // **** Means this won't complain about possible undefined.

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  ticketSetupCommand,
  welcomeCommand,
  rolesCommand,
  promoteCommand,
  demoteCommand,
  applicationSetupCommand,
  denyApplicationCommand,
];

client.once('ready', () => console.log(`${client.user?.tag} logged in`));

client.on('messageCreate', async (message) => {
  const { channelId } = message;
  let messageRecord;
  const ticketDB = await ticketRepository.findOneBy({ channelId });

  if (ticketDB) {
    messageRecord = ticketMessageRepository.create({
      content: message.content,
      createdAt: message.createdAt,
      authorTag: message.author.tag,
      authorAvatar: message.author.displayAvatarURL(),
      authorId: message.author.id,
      ticket: ticketDB,
    });
    await ticketMessageRepository.save(messageRecord);
  } else {
    const applicationDB = await applicationRepository.findOneBy({ channelId });
    if (applicationDB) {
      messageRecord = applicationMessageRepository.create({
        content: message.content,
        createdAt: message.createdAt,
        authorTag: message.author.tag,
        authorAvatar: message.author.displayAvatarURL(),
        authorId: message.author.id,
        application: applicationDB,
      });
      await applicationMessageRepository.save(messageRecord);
    }
  }
});

client.on('interactionCreate', (interaction) => {
  if (interaction.isChatInputCommand())
    client.emit('chatInputCommand', client, interaction);
  else if (interaction.isButton())
    client.emit('buttonInteraction', client, interaction);
  else if (interaction.isContextMenuCommand())
    client.emit('contextMenuInteraction', client, interaction);
});

client.on('chatInputCommand', handleChatInputCommand);

client.on('buttonInteraction', handleButtonInteraction);

client.on('contextMenuInteraction', handleContextMenuInteraction);

const main = async () => {
  try {
    if (!CLIENT_ID || !GUILD_ID || !BOT_TOKEN)
      throw new Error('Incomplete .env config!');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    AppDataSource.initialize();
    client.login(BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }
};
main();
