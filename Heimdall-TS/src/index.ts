import 'reflect-metadata';
import {
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes,
  TextChannel,
} from 'discord.js';
import 'dotenv/config';
import { AppDataSource } from './typeorm';
import { Ticket } from './typeorm/entities/Ticket';
import { Application } from './typeorm/entities/Application';
import { TicketMessage } from './typeorm/entities/TicketMessage';
import { ApplicationMessage } from './typeorm/entities/ApplicationMessage';
import { GuildConfig } from './typeorm/entities/GuildConfig';
import { registerCommands, registerSubCommands } from './utils/registry';
import { ClientInt } from './utils/ClientInt';
import HandleSpoopyGIF from './handlers/spooktober/handleSpoopyGIF';

const ticketRepository = AppDataSource.getRepository(Ticket);
const applicationRepository = AppDataSource.getRepository(Application);
const ticketMessageRepository = AppDataSource.getRepository(TicketMessage);
const applicationMessageRepository =
  AppDataSource.getRepository(ApplicationMessage);

const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

const { CLIENT_ID, GUILD_ID, BOT_TOKEN } = process.env;

const client = new ClientInt({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
const rest = new REST({ version: '10' }).setToken(BOT_TOKEN!); // **** Means this won't complain about possible undefined.

client.once('ready', () => console.log(`${client.user?.tag} logged in`));

client.on('messageCreate', async (message) => {
  const { channelId } = message;

  const checkHalloween = () => {
    if (
      new Date() > new Date(new Date().getFullYear().toString() + '-09-30') &&
      new Date() < new Date(new Date().getFullYear().toString() + '-11-01') &&
      !message.author.bot
    )
      new HandleSpoopyGIF().run(client, message, channelId);
  };
  checkHalloween();

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

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    const cmd = await client.commands.get(commandName);

    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommandName = interaction.options.getSubcommand(false);

    if (subcommandName) {
      if (subcommandGroup) {
        const subcommandInstance = client.slashSubcommands.get(commandName);
        await subcommandInstance.groupCommands
          .get(subcommandGroup)
          .get(subcommandName)
          .run(client, interaction);
      } else {
        const subcommandInstance = client.slashSubcommands.get(commandName);
        await subcommandInstance.groupCommands
          .get(subcommandName)
          .run(client, interaction);
      }
      return;
    }

    if (cmd) {
      cmd.run(client, interaction);
    } else {
      interaction.reply({
        content: 'This command is not registered yet!',
        ephemeral: true,
      });
    }
  }
  if (interaction.isButton()) {
    client.commands.get(interaction.customId).run(client, interaction);
  }
});

client.on('guildMemberAdd', async (member) => {
  const guildConfig = await guildConfigRepository.findOneBy({
    guildId: GUILD_ID,
  });
  if (!guildConfig) {
    console.log(
      'No Guild config exists, make sure to register the Guild First.'
    );
    return;
  }
  const log = client.channels.cache.get(
    guildConfig.logChannelId
  ) as TextChannel;

  member.roles.add(
    member.guild.roles.cache.find((role) => role.name === 'New User')!
  );

  log.send({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: 'Member joined',
        })
        .setTimestamp()
        .setColor(0x2ecc71)
        .setTimestamp(new Date())
        .setDescription(`<@${member.user.id}>`)
        .addFields(
          {
            name: 'Name:',
            value: member.displayName,
            inline: true,
          },
          {
            name: 'ID:',
            value: member.id,
            inline: true,
          },
          {
            name: 'Account created:',
            value: new Date(member.user.createdAt).toLocaleDateString('en-GB'),
            inline: true,
          }
        )
        .setThumbnail(member.user.displayAvatarURL()),
    ],
  });
});

client.on('guildMemberRemove', async (member) => {
  const guildConfig = await guildConfigRepository.findOneBy({
    guildId: GUILD_ID,
  });
  if (!guildConfig) {
    console.log(
      'No Guild config exists, make sure to register the Guild First.'
    );
    return;
  }
  const log = client.channels.cache.get(
    guildConfig.logChannelId
  ) as TextChannel;

  log.send({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: 'Member Left',
        })
        .setTimestamp()
        .setColor(0xf44336)
        .setTimestamp(new Date())
        .setDescription(`${member}`)
        .addFields(
          {
            name: 'Name:',
            value: member.displayName,
            inline: true,
          },
          {
            name: 'ID:',
            value: member.id,
            inline: true,
          },
          {
            name: 'Account created:',
            value: new Date(member.user.createdAt).toLocaleDateString('en-GB'),
            inline: true,
          }
        )
        .setThumbnail(member.user.displayAvatarURL()),
    ],
  });
});

const main = async () => {
  try {
    if (!CLIENT_ID || !GUILD_ID || !BOT_TOKEN)
      throw new Error('Incomplete .env config!');

    await registerCommands(client, '../handlers');
    await registerSubCommands(client);

    const commandsJSON = client.commands
      .filter((cmd) => typeof cmd.getCommandJSON === 'function')
      .map((cmd) => cmd.getCommandJSON());

    const subCommandsJSON = client.slashSubcommands.map((cmd) =>
      cmd.getCommandJSON()
    );
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [...commandsJSON, ...subCommandsJSON],
    });

    AppDataSource.initialize();
    client.login(BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }
};
main();
