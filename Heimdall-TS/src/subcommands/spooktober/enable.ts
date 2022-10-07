import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
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

class SpooktoberEnableSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'enable');
  }

  async run(
    client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
    const { guildId } = interaction;
    let guildConfig = await guildConfigRepository.findOneBy({
      guildId: guildId!,
    });

    let spooktoberConfig = await spooktoberConfigRepository.findOneBy({
      guildId: guildId!,
    });
    try {
      if (!guildConfig) {
        await interaction.reply({
          content: 'Please register the Guild First.',
        });
        return;
      }
      if (!spooktoberConfig) {
        spooktoberConfig = spooktoberConfigRepository.create({
          guildId: guildId!,
          enabled: true,
          blacklist: [],
        });
      } else {
        spooktoberConfig.enabled = true;
      }
      await spooktoberConfigRepository.save(spooktoberConfig);
      await interaction.reply({
        content: 'Spooktober plugin enabled.',
        ephemeral: true,
      });
      const log = client.channels.cache.get(
        guildConfig.logChannelId
      ) as TextChannel;

      log.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('Spooktober plugin enabled')
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL()!,
            })
            .setTimestamp()
            .setFooter({ text: 'Command Used: /spooktober enable' }),
        ],
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: 'There was an issue enabling the Spooktober plugin',
        ephemeral: true,
      });
    }
  }
}

export default SpooktoberEnableSubCommand;
