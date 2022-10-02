import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  GuildMember,
  GuildTextBasedChannel,
  Role,
  TextChannel,
} from 'discord.js';
import { applicationAccepted, applicationContent } from '../schema/application';

import { AppDataSource } from '../typeorm';
import { Application } from '../typeorm/entities/Application';
import { ApplicationConfig } from '../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../typeorm/entities/GuildConfig';
import { SpooktoberConfig } from '../typeorm/entities/SpooktoberConfig';
import { TicketConfig } from '../typeorm/entities/TicketConfig';
import { isDefined } from '../utils/Helpers';

const ticketConfigRepository = AppDataSource.getRepository(TicketConfig);
const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);

const applicationRepository = AppDataSource.getRepository(Application);

const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);

export const handleChatInputCommand = async (
  client: Client,
  interaction: ChatInputCommandInteraction<CacheType>
) => {
  let guildMember: GuildMember;

  const { guildId, channelId } = interaction;

  if (!isDefined(guildId)) {
    console.log('GuildId is Null.');
    await interaction.reply({
      content: 'This bot is likely not registered to this server.',
      ephemeral: true,
    });
    return;
  }
  let applicationConfig = await applicationConfigRepository.findOneBy({
    guildId,
  });

  let guildConfig = await guildConfigRepository.findOneBy({
    guildId,
  });

  let ticketConfig = await ticketConfigRepository.findOneBy({
    guildId,
  });

  let spooktoberConfig = await spooktoberConfigRepository.findOneBy({
    guildId,
  });

  let application = await applicationRepository.findOneBy({
    channelId,
  });

  switch (interaction.commandName) {
    case 'deny':
      {
        if (!applicationConfig) {
          await interaction.reply({
            content: 'This server has not set up the application system yet.',
            ephemeral: true,
          });
          return;
        }
        const channel = interaction.channel as GuildTextBasedChannel;

        if (!application) {
          await interaction.reply({
            content: 'This channel is not an application channel.',
            ephemeral: true,
          });
          return;
        }

        await applicationRepository.update(
          { id: application.id },
          { status: 'denied' }
        );

        if (isDefined(client.user)) {
          await channel.edit({
            permissionOverwrites: [
              {
                allow: ['ViewChannel', 'SendMessages'],
                id: applicationConfig.role,
              },
              { allow: ['ViewChannel', 'SendMessages'], id: client.user.id },
              { deny: ['ViewChannel', 'SendMessages'], id: guildId },
            ],
          });
        }

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
        if (!applicationConfig) {
          await interaction.reply({
            content: 'This server has not set up the application system yet.',
            ephemeral: true,
          });
          return;
        }

        if (!application) {
          await interaction.reply({
            content: 'This channel is not an application channel.',
            ephemeral: true,
          });
          return;
        }

        await applicationRepository.update(
          { id: application.id },
          { status: 'accepted' }
        );

        await interaction.reply({
          content: applicationAccepted,
          components: [
            new ActionRowBuilder<ButtonBuilder>().setComponents(
              new ButtonBuilder()
                .setCustomId('accept-welcome')
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept'),

              new ButtonBuilder()
                .setCustomId('decline-welcome')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Decline')
            ),
          ],
        });
      }
      break;
    case 'tickets': {
      if (!guildConfig) {
        console.log(
          'No Guild config exists, make sure to register the Guild First.'
        );
        return;
      }

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

      try {
        if (!ticketConfig) {
          const msg = await channel.send(messageOptions);
          ticketConfig = ticketConfigRepository.create({
            guildId: guildId,
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

        const log = client.channels.cache.get(
          guildConfig.logChannelId
        ) as TextChannel;

        log.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2ecc71)
              .setTitle('Ticket System initialized')
              .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
              })
              .setTimestamp()
              .setFooter({ text: 'Command Used: /tickets' }),
          ],
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
      if (!guildConfig) {
        console.log(
          'No Guild config exists, make sure to register the Guild First.'
        );
        return;
      }
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

      try {
        if (!applicationConfig) {
          const msg = await channel.send(messageOptions);
          applicationConfig = applicationConfigRepository.create({
            guildId: guildId,
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
        const log = client.channels.cache.get(
          guildConfig.logChannelId
        ) as TextChannel;

        log.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2ecc71)
              .setTitle('Application System initialized')
              .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()!,
              })
              .setTimestamp()
              .setFooter({ text: 'Command Used: /applications' }),
          ],
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
      guildMember = interaction.options.getMember('guildMember') as GuildMember;
      guildMember.roles.add(newRole);
      break;
    }

    case 'welcome':
      await interaction.reply({
        content: `Welcome ${interaction.options.getMember('guildMember')}. `,
      });
      break;

    case 'register':
      {
        const channel = interaction.options.getChannel(
          'channel'
        ) as GuildTextBasedChannel;

        try {
          if (!guildConfig) {
            guildConfig = guildConfigRepository.create({
              guildId: guildId,
              logChannelId: channel.id,
            });
          } else {
            guildConfig.logChannelId = channel.id;
          }
          await guildConfigRepository.save(guildConfig);
          await interaction.reply({
            content:
              'Guild Registered. Note: Make sure to initialize other services.',
            ephemeral: true,
          });
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('Guild Registered!')
                .setDescription(
                  'Some services need to be registered separately.'
                )
                .addFields(
                  { name: 'Ticket System', value: '/tickets' },
                  { name: 'Application System', value: '/applications' }
                )
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL()!,
                })
                .setTimestamp()
                .setFooter({ text: 'Command Used: /tickets' }),
            ],
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue Registering the Guild.',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / enable':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: true,
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
      break;

    case 'spooktober / disable':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          } else {
            spooktoberConfig.enabled = false;
          }
          await spooktoberConfigRepository.save(spooktoberConfig);
          await interaction.reply({
            content: 'Spooktober plugin disabled.',
            ephemeral: true,
          });
          const log = client.channels.cache.get(
            guildConfig.logChannelId
          ) as TextChannel;

          log.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('Spooktober plugin disabled')
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL()!,
                })
                .setTimestamp()
                .setFooter({ text: 'Command Used: /spooktober disable' }),
            ],
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue disabling the Spooktober plugin',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / status':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          }
          await interaction.reply({
            content: `Spooktober plugin is ${
              spooktoberConfig.enabled ? 'enabled' : 'disabled'
            }`,
            ephemeral: true,
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue getting the Spooktober plugin status',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / blacklist / add':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          }
          const channel = interaction.options.getChannel(
            'channel'
          ) as TextChannel;
          spooktoberConfig.blacklist.push(channel.id);
          await spooktoberConfigRepository.save(spooktoberConfig);
          await interaction.reply({
            content: `Channel ${channel} added to the blacklist.`,
            ephemeral: true,
          });

          const log = client.channels.cache.get(
            guildConfig.logChannelId
          ) as TextChannel;

          log.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle(`Spooktober: Channel ${channel} Blacklisted`)
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL()!,
                })
                .setTimestamp()
                .setFooter({
                  text: 'Command Used: /spooktober blacklist add {channel}',
                }),
            ],
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue adding the channel to the blacklist',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / blacklist / remove':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          }
          const channel = interaction.options.getChannel(
            'channel'
          ) as TextChannel;
          spooktoberConfig.blacklist = spooktoberConfig.blacklist.filter(
            (id) => id !== channel.id
          );
          await spooktoberConfigRepository.save(spooktoberConfig);
          await interaction.reply({
            content: `Channel ${channel} removed from the blacklist.`,
            ephemeral: true,
          });

          const log = client.channels.cache.get(
            guildConfig.logChannelId
          ) as TextChannel;

          log.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle(
                  `Spooktober: Channel ${channel} removed from blacklist`
                )
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL()!,
                })
                .setTimestamp()
                .setFooter({
                  text: 'Command Used: /spooktober blacklist remove {channel}',
                }),
            ],
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content:
              'There was an issue removing the channel from the blacklist',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / blacklist / list':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          }
          const channels = spooktoberConfig.blacklist.map((id) =>
            client.channels.cache.get(id)
          );
          await interaction.reply({
            content: `Blacklisted Channels: ${channels.join(', ')}`,
            ephemeral: true,
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue getting the blacklist',
            ephemeral: true,
          });
        }
      }
      break;

    case 'spooktober / blacklist / clear':
      {
        try {
          if (!guildConfig) {
            await interaction.reply({
              content: 'Please register the Guild First.',
            });
            return;
          }
          if (!spooktoberConfig) {
            spooktoberConfig = spooktoberConfigRepository.create({
              guildId: guildId,
              enabled: false,
            });
          }
          spooktoberConfig.blacklist = [];
          await spooktoberConfigRepository.save(spooktoberConfig);
          await interaction.reply({
            content: `Blacklist cleared.`,
            ephemeral: true,
          });

          const log = client.channels.cache.get(
            guildConfig.logChannelId
          ) as TextChannel;

          log.send({
            embeds: [
              new EmbedBuilder()

                .setColor(0x2ecc71)
                .setTitle(`Spooktober: Blacklist Cleared`)
                .setAuthor({
                  name: interaction.user.tag,
                  iconURL: interaction.user.avatarURL()!,
                })
                .setTimestamp()
                .setFooter({
                  text: 'Command Used: /spooktober blacklist clear',
                }),
            ],
          });
        } catch (error) {
          console.log(error);
          await interaction.reply({
            content: 'There was an issue clearing the blacklist',
            ephemeral: true,
          });
        }
      }
      break;

    default:
      await interaction.reply({
        content: `This command has been registered but no interaction has been assigned. That usually means the command is not available for public use. If you think this is a mistake, please contact Tech.`,
        ephemeral: true,
      });
      break;
  }
};
