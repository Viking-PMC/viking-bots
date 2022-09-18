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
        if (!guildId) {
          console.log('GuildId is Null.');
          return;
        }
        try {
          const ticketConfig = await ticketConfigRepository.findOneBy({
            guildId: guildId,
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
          content: 'This option is for the ticket creator and Tech only.',
          ephemeral: true,
        });
      }

      break;
    }

    case 'open-app':
      {
        if (!guild) {
          console.log('Guild is Null.');
          return;
        }
        if (!guildId) {
          console.log('GuildId is Null.');
          return;
        }
        try {
          const applicationConfig = await applicationConfigRepository.findOneBy(
            {
              guildId: guildId,
            }
          );
          if (!applicationConfig) {
            console.log('No application config exists');
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
                  id: applicationConfig.role,
                },
                { deny: ['ViewChannel', 'SendMessages'], id: guildId },
              ],
            });
            const newApplicationMessage = await newApplicationChannel.send({
              content: '[APPLICATION INSTRUCTIONS]',
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
            content: 'There was an error creating the application.',
            ephemeral: true,
          });
        }
      }
      break;
    case 'close-app': {
      const channel = interaction.channel as GuildTextBasedChannel;

      if (!guildId) {
        console.log('GuildId is Null.');
        return;
      }

      const applicationConfig = await applicationConfigRepository.findOneBy({
        guildId: guildId,
      });
      if (!applicationConfig) {
        console.log('No application config exists');
        await interaction.reply({
          content: 'No Application Config exists.',
          ephemeral: true,
        });
        return;
      }

      const application = await applicationRepository.findOneBy({ channelId });
      if (!application) {
        console.log("Application wasn't found");
        await interaction.reply({
          content: 'The application was not found.',
          ephemeral: true,
        });
        return;
      }

      await channel.delete();

      break;
    }
    default:
      break;
  }
};
