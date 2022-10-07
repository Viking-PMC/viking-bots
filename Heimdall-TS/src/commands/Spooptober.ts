import {
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';

export const spooktoberSetupCommand = new SlashCommandBuilder()
  .setName('spooktober')
  .setDescription('Edit Spooktober Plugin Settings')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addSubcommand((subcommand) =>
    subcommand.setName('enable').setDescription('Enable Spooktober plugin')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('disable').setDescription('Disable Spooktober plugin')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('status')
      .setDescription('Check if Spooktober plugin is enabled')
  )
  .addSubcommandGroup((group) =>
    group
      .setName('blacklist')
      .setDescription('Blacklist options for Spooktober plugin')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Add a channel to the blacklist')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Channel to add to the blacklist')
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('remove')
          .setDescription('Remove a channel from the blacklist')
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('Channel to remove from the blacklist')
              .setRequired(true)
              .addChannelTypes(
                ChannelType.GuildText,
                ChannelType.PublicThread,
                ChannelType.PrivateThread
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('list')
          .setDescription('List all channels in the blacklist')
      )
  )
  .toJSON();
