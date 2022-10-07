import {
  ActionRowBuilder,
  ButtonBuilder,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildTextBasedChannel,
} from 'discord.js';
import { applicationContent } from '../../schema/application';
import { AppDataSource } from '../../typeorm';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class ApplicationEnableSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'enable');
  }

  async run(
    _client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const { guildId } = interaction;

    let guildConfig = await guildConfigRepository.findOneBy({
      guildId: guildId!,
    });

    if (!guildConfig) {
      await interaction.reply({
        content: 'Please register the Guild First.',
      });
      return;
    }

    let applicationConfig = await applicationConfigRepository.findOneBy({
      guildId: guildId!,
    });
    const messageOptions = {
      content: applicationContent,
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId('open-application')
            .setEmoji('🎟')
            .setLabel('Apply')
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
    if (!applicationConfig) {
      const msg = await channel.send(messageOptions);
      applicationConfig = applicationConfigRepository.create({
        guildId: guildId!,
        messageId: msg.id,
        channelId: channel.id,
        categoryId: category.id,
        role: role?.id,
        enabled: true,
      });
    } else {
      const msg = await channel.send(messageOptions);
      applicationConfig.messageId = msg.id;
      applicationConfig.channelId = channel.id;
      applicationConfig.categoryId = category.id;
      applicationConfig.role = role?.id!;
      applicationConfig.enabled = true;
    }

    await applicationConfigRepository.save(applicationConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Application Plugin Enabled');
    embed.setDescription(
      'Application plugin is now enabled. You can now use the application commands.'
    );
    embed.setColor(0x2ecc71);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default ApplicationEnableSubCommand;
