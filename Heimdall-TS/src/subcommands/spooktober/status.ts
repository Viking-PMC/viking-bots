import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { SpooktoberConfig } from '../../typeorm/entities/SpooktoberConfig';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';
import { Group } from '../../utils/BaseSlashSubCommand';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);
/**
 * Gets the spooktober Spooktober Plugin status.
 * @param client The client.
 * @param interaction The interaction.
 * @returns void
 *
 * @example
 * // Get the spooktober plugin status
 * /spooktober status
 *
 */
class SpooktoberStatusSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'status');
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

    const spooktoberConfig = await spooktoberConfigRepository.findOneBy({
      guildId: guildId!,
    });
    if (!spooktoberConfig) {
      await interaction.reply({
        content: 'Spooktober plugin is not registered.',
        ephemeral: true,
      });
      return;
    }
    if (spooktoberConfig.enabled) {
      await interaction.reply({
        content: 'Spooktober plugin is enabled',
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: 'Spooktober plugin is not enabled',
      ephemeral: true,
    });
  }
}

export default SpooktoberStatusSubCommand;
