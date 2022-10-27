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
      .addSubcommand((subcommand) =>
        subcommand.setName('accept').setDescription('Accept an application')
      )
      .addSubcommand((subcommand) =>
        subcommand.setName('deny').setDescription('Deny an application')
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('close')
          .setDescription('Close an application channel')
      )
      .toJSON();
  }
}

export default ApplicationSubCommand;
