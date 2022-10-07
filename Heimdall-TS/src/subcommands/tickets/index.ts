import {
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseSlashSubCommand } from '../../utils/BaseSlashSubCommand';

class TicketSubCommand extends BaseSlashSubCommand {
  constructor() {
    super('tickets', [], ['enable', 'disable', 'status', 'add']);
  }

  getCommandJSON() {
    return new SlashCommandBuilder()
      .setName('tickets')
      .setDescription('Edit Ticket Plugin Settings')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
      .addSubcommand((subcommand) =>
        subcommand
          .setName('enable')
          .setDescription('Enable Ticket plugin')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('channel for Ticket')
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText)
          )
          .addChannelOption((option) =>
            option
              .setName('category')
              .setDescription('category for the Tickets')
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
        subcommand.setName('disable').setDescription('Disable Ticket plugin')
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('status')
          .setDescription('Check if Ticket plugin is enabled')
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Add a User to the ticket')
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('User to add to the ticket')
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName('close').setDescription('Close the ticket')
      )

      .toJSON();
  }
}

export default TicketSubCommand;
