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

class SpooktoberBlacklistRemoveSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'remove');
  }

  async run(
    _client: ClientInt,
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

    const index = spooktoberConfig.blacklist.indexOf(channel.id);
    if (index === -1) {
      await interaction.reply({
        content: 'Channel is not blacklisted',
        ephemeral: true,
      });
      return;
    }

    spooktoberConfig.blacklist.splice(index, 1);
    await spooktoberConfigRepository.save(spooktoberConfig);

    const embed = new EmbedBuilder();
    embed.setTitle('Channel Blacklist Removed');
    embed.setDescription(
      `Channel ${channel} has been removed from the Spooktober plugin blacklist.`
    );
    embed.setColor(0x2ecc71);

    await interaction.reply({
      embeds: [embed],
    });
  }
}

export default SpooktoberBlacklistRemoveSubCommand;
