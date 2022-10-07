import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';

import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class ApplicationStatusSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'status');
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
    if (applicationConfig.enabled) {
      await interaction.reply({
        content: 'Application plugin is enabled',
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: 'Application plugin is not enabled',
      ephemeral: true,
    });
  }
}

export default ApplicationStatusSubCommand;
