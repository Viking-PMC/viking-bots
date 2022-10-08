import { ButtonInteraction, CacheType, ChannelType, Client } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { Ticket } from '../../typeorm/entities/Ticket';
import { TicketConfig } from '../../typeorm/entities/TicketConfig';
import TicketsBaseCommand from '../../utils/TicketsBaseCommand';

const ticketRepository = AppDataSource.getRepository(Ticket);

class CreateTicketButtonCommand extends TicketsBaseCommand {
  constructor() {
    super('create-ticket');
  }
  get name(): string {
    return this._name;
  }
  // open a ticket
  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild } = interaction;

    const { ticketConfig }: { ticketConfig: TicketConfig } =
      (await this.runTicketsCheck(client, interaction, {
        createdBy: interaction.user.id,
        status: 'opened',
      })) as { ticketConfig: TicketConfig };

    if (ticketConfig.messageId === interaction.message.id) {
      const newTicket = ticketRepository.create({
        createdBy: interaction.user.id,
      });

      const savedTicket = await ticketRepository.save(newTicket);

      const newTicketChannel = await guild!.channels.create({
        name: `ticket-${savedTicket.id.toString()}`,
        type: ChannelType.GuildText,
        parent: ticketConfig.categoryId,
        permissionOverwrites: [
          {
            allow: ['ViewChannel', 'SendMessages'],
            id: interaction.user.id,
          },
          { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
          {
            allow: ['ViewChannel', 'SendMessages'],
            id: ticketConfig.role,
          },
          { deny: ['ViewChannel', 'SendMessages'], id: guildId! },
        ],
      });
      const newTicketMessage = await newTicketChannel.send({
        content:
          'Please explain your issue. A member of tech support will be with you shortly.',
      });
      ticketRepository.update(
        { id: savedTicket.id },
        {
          messageId: newTicketMessage.id,
          channelId: newTicketChannel.id,
          status: 'opened',
        }
      );
      await interaction.reply({
        content: 'Ticket Created! Make sure to read all the instructions.',
        ephemeral: true,
      });
    }
  }
}

export default CreateTicketButtonCommand;
