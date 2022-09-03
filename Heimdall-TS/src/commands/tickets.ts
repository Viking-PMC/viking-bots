import {
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

export const ticketSetupCommand = new SlashCommandBuilder()
  .setName('tickets')
  .setDescription('Initialize the Ticket System')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('channel for tickets')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  )
  .addChannelOption((option) =>
    option
      .setName('category')
      .setDescription('category for the tickets')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildCategory)
  )
  .toJSON();
