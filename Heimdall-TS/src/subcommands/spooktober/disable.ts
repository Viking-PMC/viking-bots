import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { SpooktoberConfig } from '../../typeorm/entities/SpooktoberConfig';
import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class SpooktoberDisableSubCommand extends BaseSubCommandExecutor {
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
    spooktoberConfig.enabled = false;
    await spooktoberConfigRepository.save(spooktoberConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Spooktober Plugin Disabled');
    embed.setDescription('Spooktober plugin has been disabled.');
    embed.setColor(0xf44336);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default SpooktoberDisableSubCommand;
