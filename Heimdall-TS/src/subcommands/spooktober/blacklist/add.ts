import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
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

class SpooktoberBlacklistAddSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'add');
  }

  async run(
    client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    const { guildId, options } = interaction;

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

    const channel = options.getChannel('channel', true) as TextChannel;

    if (spooktoberConfig.blacklist.includes(channel.id)) {
      await interaction.reply({
        content: 'Channel is already blacklisted.',
        ephemeral: true,
      });
      return;
    }

    spooktoberConfig.blacklist.push(channel.id);
    await spooktoberConfigRepository.save(spooktoberConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Channel Blacklisted');
    embed.setDescription(
      `Channel ${channel} has been blacklisted from the Spooktober plugin.`
    );
    embed.setColor(0xf44336);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default SpooktoberBlacklistAddSubCommand;
