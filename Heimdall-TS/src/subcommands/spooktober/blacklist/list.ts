import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { AppDataSource } from '../../../typeorm';
import { GuildConfig } from '../../../typeorm/entities/GuildConfig';
import { SpooktoberConfig } from '../../../typeorm/entities/SpooktoberConfig';
import { Group } from '../../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../../utils/ClientInt';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class SpooktoberBlacklistListSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'list');
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

    const embed = new EmbedBuilder()
      .setTitle('Blacklisted Channels')
      .setDescription(spooktoberConfig.blacklist.map((c) => `<#${c}>`).join(''))
      .setColor(0x607d8b);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default SpooktoberBlacklistListSubCommand;
