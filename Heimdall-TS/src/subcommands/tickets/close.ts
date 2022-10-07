import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { Ticket } from '../../typeorm/entities/Ticket';
import { TicketConfig } from '../../typeorm/entities/TicketConfig';
import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const ticketRepository = AppDataSource.getRepository(Ticket);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class TicketCloseSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'close');
  }

  async run(
    _client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    const { guildId, channel } = interaction;

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
    if (!ticketConfig.enabled) {
      await interaction.reply({
        content: 'Ticket plugin is not enabled',
        ephemeral: true,
      });
      return;
    }

    const ticket = await ticketRepository.findOneBy({
      channelId: channel!.id,
    });
    if (!ticket) {
      await interaction.reply({
        content: 'This is not a ticket channel.',
        ephemeral: true,
      });
      return;
    }

    await ticketRepository.update(ticket.id, {
      status: 'closed',
    });
    await channel!.delete();
  }
}

export default TicketCloseSubCommand;
