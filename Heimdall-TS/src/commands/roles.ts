import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const rolesCommand = new SlashCommandBuilder()
  .setName('addrole')
  .setDescription('Add a role')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
  .addRoleOption((option) =>
    option
      .setName('newrole')
      .setDescription('Name of the new role')
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('Username of the user to add the role to.')
      .setRequired(true)
  )
  .toJSON(); // Making sure that after the Command is built, we pass it as JSON to use when registering commands.

export const promoteCommand = new ContextMenuCommandBuilder()
  .setName('promote')
  .setType(2)
  .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
  .toJSON();

export const demoteCommand = new ContextMenuCommandBuilder()
  .setName('demote')
  .setType(2)
  .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
  .toJSON();
