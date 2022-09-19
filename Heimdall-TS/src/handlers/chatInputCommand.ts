import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  GuildMember,
  GuildTextBasedChannel,
  Role,
} from 'discord.js';
import { applicationContent } from '../schema/application';

import { AppDataSource } from '../typeorm';
import { Application } from '../typeorm/entities/Application';
import { ApplicationConfig } from '../typeorm/entities/ApplicationConfig';
import { TicketConfig } from '../typeorm/entities/TicketConfig';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);

const applicationRepository = AppDataSource.getRepository(Application);

export const handleChatInputCommand = async (
  client: Client,
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  if (!interaction) {
    return console.log('No interaction was received...');
  }
  let user: GuildMember;

  const { guildId, channelId } = interaction;
  switch (interaction.commandName) {
    case 'deny':
      {
        if (!guildId) {
          console.log('GuildId is Null.');
          return;
        }
        const applicationConfig = await applicationConfigRepository.findOneBy({
          guildId: guildId,
        });
        if (!applicationConfig) {
          console.log('No application config exists');
          return;
        }

        user = interaction.options.getMember('user') as GuildMember;
        const channel = interaction.channel as GuildTextBasedChannel;
        const application = await applicationRepository.findOneBy({
          channelId,
        });

        await applicationRepository.update(
          { id: application!.id },
          { status: 'denied' }
        );
        await channel.edit({
          permissionOverwrites: [
            {
              deny: ['ViewChannel', 'SendMessages'],
              id: user.id,
            },
            {
              allow: ['ViewChannel', 'SendMessages'],
              id: applicationConfig.role,
            },
            { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
            { deny: ['ViewChannel', 'SendMessages'], id: guildId },
          ],
        });

        await interaction.reply({
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId('deny-app')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Application Denied...')
                .setEmoji('🎟')
                .setDisabled(true),

              new ButtonBuilder()
                .setCustomId('create-transcript')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Create a Transcript')
                .setEmoji('💾'),

              new ButtonBuilder()
                .setCustomId('close-app')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Close Application')
                .setEmoji('🎟')
            ),
          ],
        });
      }
      break;

    case 'accept':
      {
        if (!guildId) {
          console.log('GuildId is Null.');
          return;
        }
        const applicationConfig = await applicationConfigRepository.findOneBy({
          guildId: guildId,
        });
        if (!applicationConfig) {
          console.log('No application config exists');
          return;
        }

        user = interaction.options.getMember('user') as GuildMember;
        const channel = interaction.channel as GuildTextBasedChannel;
        const application = await applicationRepository.findOneBy({
          channelId,
        });

        await applicationRepository.update(
          { id: application!.id },
          { status: 'accepted' }
        );
        await channel.edit({
          permissionOverwrites: [
            {
              deny: ['ViewChannel', 'SendMessages'],
              id: user.id,
            },
            {
              allow: ['ViewChannel', 'SendMessages'],
              id: applicationConfig.role,
            },
            { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
            { deny: ['ViewChannel', 'SendMessages'], id: guildId },
          ],
        });
        await interaction.reply({
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId('deny-app')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Application Denied...')
                .setEmoji('🎟')
                .setDisabled(true),

              new ButtonBuilder()
                .setCustomId('create-transcript')
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Create a Transcript')
                .setEmoji('💾'),

              new ButtonBuilder()
                .setCustomId('close-app')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Close Application')
                .setEmoji('🎟')
            ),
          ],
        });
      }
      break;
    case 'tickets': {
      const messageOptions = {
        content: 'Press button to create a ticket.',
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('create-ticket')
              .setEmoji('🎟')
              .setLabel('Create Ticket')
              .setStyle(1)
          ),
        ],
      };
      const channel = interaction.options.getChannel(
        'channel'
      ) as GuildTextBasedChannel;
      const category = interaction.options.getChannel(
        'category'
      ) as GuildTextBasedChannel;

      const role = interaction.options.getRole('role');

      let ticketConfig = await ticketConfigRepository.findOneBy({
        guildId: guildId!,
      });

      try {
        if (!ticketConfig) {
          const msg = await channel.send(messageOptions);
          ticketConfig = ticketConfigRepository.create({
            guildId: guildId!,
            messageId: msg.id,
            channelId: channel.id,
            categoryId: category.id,
            role: role?.id,
          });
        } else {
          const msg = await channel.send(messageOptions);
          ticketConfig.channelId = channel.id;
          ticketConfig.messageId = msg.id;
          ticketConfig.categoryId = category.id;
          if (role) {
            ticketConfig.role = role.id;
          }
        }
        await ticketConfigRepository.save(ticketConfig);
        await interaction.reply({
          content: 'Ticket System Initialized.',
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: 'There was an issue Initializing the Ticket System',
          ephemeral: true,
        });
      }
      break;
    }
    case 'applications': {
      const messageOptions = {
        content: applicationContent,
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('open-app')
              .setEmoji('🎟')
              .setLabel('Apply')
              .setStyle(1)
          ),
        ],
      };
      const channel = interaction.options.getChannel(
        'channel'
      ) as GuildTextBasedChannel;
      const category = interaction.options.getChannel(
        'category'
      ) as GuildTextBasedChannel;
      const role = interaction.options.getRole('role');

      let applicationConfig = await applicationConfigRepository.findOneBy({
        guildId: guildId!,
      });

      try {
        if (!applicationConfig) {
          const msg = await channel.send(messageOptions);
          applicationConfig = applicationConfigRepository.create({
            guildId: guildId!,
            messageId: msg.id,
            channelId: channel.id,
            categoryId: category.id,
            role: role?.id,
          });
        } else {
          const msg = await channel.send(messageOptions);
          applicationConfig.channelId = channel.id;
          applicationConfig.messageId = msg.id;
          applicationConfig.categoryId = category.id;
          if (role) {
            applicationConfig.role = role.id;
          }
        }
        await applicationConfigRepository.save(applicationConfig);
        await interaction.reply({
          content: 'Application System Initialized.',
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: 'There was an issue Initializing the Application System',
          ephemeral: true,
        });
      }
      break;
    }

    case 'addrole': {
      const newRole = interaction.options.getRole('newrole') as Role;
      user = interaction.options.getMember('user') as GuildMember;
      user.roles.add(newRole);
      break;
    }

    case 'welcome':
      await interaction.reply({
        content: `Welcome ${interaction.options.getMember('user')}. `,
      });
      break;
    case 'steps':
      await interaction.reply({
        content: `These are the step to become a Viking.`,
      });
      break;
    default:
      await interaction.reply({
        content: `This command has been registered but no interaction has been assigned. That usually means the command is not available for public use. If you think this is a mistake, please contact Tech.`,
        ephemeral: true,
      });
      break;
  }
};
