import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  ChannelType,
  Client,
  GuildMemberRoleManager,
  GuildTextBasedChannel,
} from 'discord.js';
import { AppDataSource } from '../typeorm';
import { Application } from '../typeorm/entities/Application';
import { ApplicationConfig } from '../typeorm/entities/ApplicationConfig';
import { Ticket } from '../typeorm/entities/Ticket';
import { TicketConfig } from '../typeorm/entities/TicketConfig';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const ticketRepository = AppDataSource.getRepository(Ticket);

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);

export const handleButtonInteraction = async (
  client: Client,
  interaction: ButtonInteraction<CacheType>
) => {
  const { guild, guildId, channelId } = interaction;
  switch (interaction.customId) {
    case 'create-ticket':
      {
        try {
          const ticketConfig = await ticketConfigRepository.findOneBy({
            guildId: guildId || '',
          });
          if (!ticketConfig) {
            console.log('No ticket config exists');
            return;
          }

          if (!guild) {
            console.log('Guild is Null.');
            return;
          }

          const ticket = await ticketRepository.findOneBy({
            createdBy: interaction.user.id,
            status: 'opened',
          });

          if (ticket) {
            await interaction.reply({
              content: 'You already have a ticket of this type open.',
              ephemeral: true,
            });
            return;
          }

          if (ticketConfig.messageId === interaction.message.id) {
            const newTicket = ticketRepository.create({
              createdBy: interaction.user.id,
            });

            const savedTicket = await ticketRepository.save(newTicket);

            const newTicketChannel = await guild.channels.create({
              name: `ticket-${savedTicket.id.toString().padStart(6, '0')}`,
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
                  id: '1008476277675671663',
                },
                { deny: ['ViewChannel', 'SendMessages'], id: guildId! },
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
              content:
                'Ticket Created! Make sure to read all the instructions.',
              ephemeral: true,
            });
          }
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an error creating the ticket.',
            ephemeral: true,
          });
        }
      }
      break;
    case 'close-ticket': {
      const user = interaction.user;
      const channel = interaction.channel as GuildTextBasedChannel;
      const roles = interaction.member?.roles as GuildMemberRoleManager;
      const ticket = await ticketRepository.findOneBy({ channelId });
      if (!ticket) return console.log("Ticket wasn't found");

      if (
        user.id === ticket.createdBy ||
        roles.cache.some((r) => r.name === 'Tech')
      ) {
        await ticketRepository.update({ id: ticket.id }, { status: 'closed' });
        await channel.delete();
      } else {
        await interaction.reply({
          content: 'This option is for the new user and Tech only.',
          ephemeral: true,
        });
      }

      break;
    }

    case 'open-app':
      {
        try {
          const applicationConfig = await applicationConfigRepository.findOneBy(
            {
              guildId: guildId || '',
            }
          );
          if (!applicationConfig) {
            console.log('No application config exists');
            return;
          }

          if (!guild) {
            console.log('Guild is Null.');
            return;
          }

          const application = await applicationRepository.findOneBy({
            createdBy: interaction.user.id,
            status: 'opened',
          });

          if (application) {
            await interaction.reply({
              content: 'You already have an open application.',
              ephemeral: true,
            });
            return;
          }

          if (applicationConfig.messageId === interaction.message.id) {
            const newApplication = applicationRepository.create({
              createdBy: interaction.user.id,
            });

            const savedApplication = await applicationRepository.save(
              newApplication
            );

            const newApplicationChannel = await guild.channels.create({
              name: `app-${interaction.user.tag}`,
              type: ChannelType.GuildText,
              parent: applicationConfig.categoryId,
              permissionOverwrites: [
                {
                  allow: ['ViewChannel', 'SendMessages'],
                  id: interaction.user.id,
                },
                { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
                {
                  allow: ['ViewChannel', 'SendMessages'],
                  id: '1008506015731433654',
                },
                { deny: ['ViewChannel', 'SendMessages'], id: guildId! },
              ],
            });
            const newApplicationMessage = await newApplicationChannel.send({
              content: 'Application Menu',
              components: [
                new ActionRowBuilder<ButtonBuilder>().setComponents(
                  new ButtonBuilder()
                    .setCustomId('close-app')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('Close Application')
                    .setEmoji('🎟')
                ),
              ],
            });
            applicationRepository.update(
              { id: savedApplication.id },
              {
                messageId: newApplicationMessage.id,
                channelId: newApplicationChannel.id,
                status: 'opened',
              }
            );
            await interaction.reply({
              content:
                'Application Created! Make sure to read all the instructions.',
              ephemeral: true,
            });
          }
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an error creating the ticket.',
            ephemeral: true,
          });
        }
      }
      break;
    case 'close-app': {
      const user = interaction.user;
      const channel = interaction.channel as GuildTextBasedChannel;
      const application = await applicationRepository.findOneBy({ channelId });
      if (!application) return console.log("Application wasn't found");

      if (user.id === application.createdBy) {
        await ticketRepository.update(
          { id: application.id },
          { status: 'closed' }
        );
        await channel.edit({
          permissionOverwrites: [
            {
              deny: ['ViewChannel', 'SendMessages'],
              id: interaction.user.id,
            },
            {
              allow: ['ViewChannel', 'SendMessages'],
              id: '1008506015731433654',
            },
            { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
            { deny: ['ViewChannel', 'SendMessages'], id: guildId! },
          ],
        });
        await interaction.update({
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId('close-app')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Application Closed...')
                .setEmoji('🎟')
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId('create-transcript')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Create a Transcript')
                .setEmoji('💾')
            ),
          ],
        });
      }

      break;
    }
    default:
      break;
  }
};
