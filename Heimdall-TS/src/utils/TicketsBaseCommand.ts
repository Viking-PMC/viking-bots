import { BaseInteraction, CacheType, Client } from 'discord.js';
import { AppDataSource } from '../typeorm';
import { Ticket } from '../typeorm/entities/Ticket';
import { TicketConfig } from '../typeorm/entities/TicketConfig';
import GuildsBaseCommand from './GuildsBaseCommand';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const ticketRepository = AppDataSource.getRepository(Ticket);

class TicketsBaseCommand extends GuildsBaseCommand {
  constructor(name: string) {
    super(name);
  }

  async runTicketsCheck(
    client: Client,
    interaction: BaseInteraction<CacheType>,
    appArgs: any
  ) {
    const { guildId } = interaction;

    if (!this.runGuildCheck(client, interaction)) {
      return false;
    }
    if (interaction.isRepliable()) {
      const ticketConfig = await ticketConfigRepository.findOneBy({
        guildId: guildId!,
      });
      if (!ticketConfig) {
        interaction.reply({
          content: 'Ticket plugin is not registered.',
          ephemeral: true,
        });
        return false;
      }
      if (!ticketConfig.enabled) {
        interaction.reply({
          content: 'Ticket plugin is not enabled.',
          ephemeral: true,
        });
        return false;
      }
      const ticket = await ticketRepository.findOneBy(appArgs);
      if (!ticket) {
        return { ticketConfig };
      }
      return { ticketConfig, ticket };
    }
  }
}

export default TicketsBaseCommand;
