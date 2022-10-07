import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionsBitField } from 'discord.js';

export const welcomeCommand = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Welcome')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
  .toJSON();

export const registerGuildCommand = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Registers the Guild.')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Channel For logging events.')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText)
  )
  .toJSON();
