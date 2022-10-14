import {
  ActionRowBuilder,
  ButtonBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
} from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { TicketConfig } from '../../typeorm/entities/TicketConfig';
import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class TicketEnableSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'enable');
  }

  async run(
    _client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const { guildId, member } = interaction;

    const hasRole = (member as GuildMember).roles.cache.some((role) =>
      role.name.toLowerCase().includes('tech')
    );

    if (!hasRole)
      await interaction.reply({
        content: 'You do not have the required role to use this command.',
        ephemeral: true,
      });

    let guildConfig = await guildConfigRepository.findOneBy({
      guildId: guildId!,
    });

    if (!guildConfig) {
      await interaction.reply({
        content: 'Please register the Guild First.',
      });
      return;
    }

    let ticketConfig = await ticketConfigRepository.findOneBy({
      guildId: guildId!,
    });
    const messageOptions = {
      content: 'Press this button to create a tech support ticket.',
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId('create-ticket')
            .setEmoji('🎟')
            .setLabel('Create Ticket')
            .setStyle(1)
        ),
      ],
    };
    const channel = interaction.options.getChannel(
      'channel'
    ) as GuildTextBasedChannel;
    const category = interaction.options.getChannel(
      'category'
    ) as GuildTextBasedChannel;
    const role = interaction.options.getRole('role');
    if (!ticketConfig) {
      const msg = await channel.send(messageOptions);
      ticketConfig = ticketConfigRepository.create({
        guildId: guildId!,
        channelId: channel.id,
        messageId: msg.id,
        categoryId: category.id,
        role: role?.id,
        enabled: true,
      });
    } else {
      const msg = await channel.send(messageOptions);
      ticketConfig.messageId = msg.id;
      ticketConfig.channelId = channel.id;
      ticketConfig.categoryId = category.id;
      ticketConfig.role = role?.id!;
      ticketConfig.enabled = true;
    }
    await ticketConfigRepository.save(ticketConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Ticket Plugin Enabled');
    embed.setDescription(
      'Ticket plugin is now enabled. You can now use the ticket commands.'
    );
    embed.setColor(0x2ecc71);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default TicketEnableSubCommand;
