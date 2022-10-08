import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';

import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class ApplicationDisableSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'disable');
  }

  async run(
    _client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
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

    const applicationConfig = await applicationConfigRepository.findOneBy({
      guildId: guildId!,
    });
    if (!applicationConfig) {
      await interaction.reply({
        content: 'Application plugin is not registered.',
        ephemeral: true,
      });
      return;
    }
    if (!applicationConfig.enabled) {
      await interaction.reply({
        content: 'Application plugin is not enabled',
        ephemeral: true,
      });
      return;
    }
    applicationConfig.enabled = false;
    await applicationConfigRepository.save(applicationConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Application Plugin Disabled');
    embed.setDescription('Application plugin has been disabled.');
    embed.setColor(0xf44336);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default ApplicationDisableSubCommand;
