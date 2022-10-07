import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { AppDataSource } from '../../../typeorm';
import { GuildConfig } from '../../../typeorm/entities/GuildConfig';
import { SpooktoberConfig } from '../../../typeorm/entities/SpooktoberConfig';
import { Group } from '../../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../../utils/ClientInt';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class SpooktoberBlacklistClearSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'clear');
  }

  async run(
    client: ClientInt,
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
    if (!spooktoberConfig.enabled) {
      await interaction.reply({
        content: 'Spooktober plugin is not enabled',
        ephemeral: true,
      });
      return;
    }

    spooktoberConfig.blacklist = [];
    await spooktoberConfigRepository.save(spooktoberConfig);

    await interaction.reply({
      content: 'Spooktober blacklist cleared.',
      ephemeral: true,
    });
  }
}

export default SpooktoberBlacklistClearSubCommand;
