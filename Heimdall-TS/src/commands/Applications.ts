import {
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

export const applicationSetupCommand = new SlashCommandBuilder()
  .setName('applications')
  .setDescription('Initialize the Application System')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('channel for Applications')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  )
  .addChannelOption((option) =>
    option
      .setName('category')
      .setDescription('category for the Applications')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildCategory)
  )
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('a role you want to be able to see the channel.')
  )
  .toJSON();

export const denyApplicationCommand = new SlashCommandBuilder()
  .setName('deny')
  .setDescription('Denies this application and removes the user from the room.')
  .toJSON();

export const acceptApplicationCommand = new SlashCommandBuilder()
  .setName('accept')
  .setDescription('Accepts this application and sends the welcome message.')
  .toJSON();
