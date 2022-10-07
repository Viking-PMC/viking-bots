import {
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseSlashSubCommand } from '../../utils/BaseSlashSubCommand';

class ApplicationSubCommand extends BaseSlashSubCommand {
  constructor() {
    super('applications', [], ['enable', 'disable', 'status']);
  }

  getCommandJSON() {
    return new SlashCommandBuilder()
      .setName('applications')
      .setDescription('Edit Applications Plugin Settings')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addSubcommand((subcommand) =>
        subcommand
          .setName('enable')
          .setDescription('Enable Applications plugin')
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
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('disable')
          .setDescription('Disable Applications plugin')
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('status')
          .setDescription('Check if Applications plugin is enabled')
      )
      .toJSON();
  }
}

export default ApplicationSubCommand;
