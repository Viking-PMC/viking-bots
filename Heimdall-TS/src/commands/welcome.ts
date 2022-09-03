import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const welcomeCommand = new ContextMenuCommandBuilder()
  .setName('welcome')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
  .setType(2)
  .toJSON();
