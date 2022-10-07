import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { TicketConfig } from '../../typeorm/entities/TicketConfig';

import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class TicketStatusSubCommand extends BaseSubCommandExecutor {
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

    const ticketConfig = await ticketConfigRepository.findOneBy({
      guildId: guildId!,
    });
    if (!ticketConfig) {
      await interaction.reply({
        content: 'Ticket plugin is not registered.',
        ephemeral: true,
      });
      return;
    }
    if (ticketConfig.enabled) {
      await interaction.reply({
        content: 'Ticket plugin is enabled',
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: 'Ticket plugin is not enabled',
      ephemeral: true,
    });
  }
}

export default TicketStatusSubCommand;
