import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChannelType,
  Client,
} from 'discord.js';
import { applicationQuestions } from '../../schema/application';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';

import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { Ticket } from '../../typeorm/entities/Ticket';
import { TicketConfig } from '../../typeorm/entities/TicketConfig';
import { BaseCommand } from '../../utils/BaseCommand';

const guildConfigRepository = AppDataSource.getRepository(GuildConfig);
const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const ticketRepository = AppDataSource.getRepository(Ticket);

class CreateTicketButtonCommand extends BaseCommand {
  constructor() {
    super('create-ticket');
  }
  get name(): string {
    return this._name;
  }
  // open a ticket
  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild, user } = interaction;
    if (!guildId || !guild) {
      return interaction.reply({
        content: 'Please use this command in a guild.',
        ephemeral: true,
      });
    }
    const guildConfig = guildConfigRepository.findOneBy({ guildId });
    if (!guildConfig) {
      return interaction.reply({
        content: 'Please register the guild first.',
        ephemeral: true,
      });
    }
    const ticketConfig = await ticketConfigRepository.findOneBy({
      guildId,
    });
    if (!ticketConfig) {
      return interaction.reply({
        content: 'Ticket plugin is not registered.',
        ephemeral: true,
      });
    }
    if (!ticketConfig.enabled) {
      return interaction.reply({
        content: 'Ticket plugin is not enabled.',
        ephemeral: true,
      });
    }
    const ticket = await ticketRepository.findOneBy({
      createdBy: interaction.user.id,
      status: 'opened',
    });
    if (ticket) {
      return interaction.reply({
        content: 'You already have an open ticket.',
        ephemeral: true,
      });
    }
    if (ticketConfig.messageId === interaction.message.id) {
      const newTicket = ticketRepository.create({
        createdBy: interaction.user.id,
      });

      const savedTicket = await ticketRepository.save(newTicket);

      const newTicketChannel = await guild.channels.create({
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
          { deny: ['ViewChannel', 'SendMessages'], id: guildId },
        ],
      });
      const newTicketMessage = await newTicketChannel.send({
        content: 'Ticket Menu',
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('close-ticket')
              .setStyle(ButtonStyle.Danger)
              .setLabel('close Ticket')
              .setEmoji('🎟')
          ),
        ],
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
