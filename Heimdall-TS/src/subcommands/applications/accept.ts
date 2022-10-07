import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { applicationAccepted } from '../../schema/application';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';

import { Group } from '../../utils/BaseSlashSubCommand';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { ClientInt } from '../../utils/ClientInt';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class ApplicationAcceptSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'accept');
  }

  async run(
    client: ClientInt,
    interaction: ChatInputCommandInteraction<CacheType>
  ) {
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

    const applicationConfig = await applicationConfigRepository.findOneBy({
      guildId: guildId!,
    });
    if (!applicationConfig) {
      await interaction.reply({
        content: 'Application plugin is not registered.',
        ephemeral: true,
      });
      return;
    }
    if (!applicationConfig.enabled) {
      await interaction.reply({
        content: 'Application plugin is not enabled',
        ephemeral: true,
      });
      return;
    }
    const application = await applicationRepository.findOneBy({
      channelId: interaction.channelId,
    });

    if (!application) {
      await interaction.reply({
        content: 'This channel is not an application channel',
        ephemeral: true,
      });
      return;
    }

    if (application.status === 'denied') {
      await interaction.reply({
        content: 'This application is already denied',
        ephemeral: true,
      });
      return;
    }

    if (application.status === 'accepted') {
      await interaction.reply({
        content: 'This application is already accepted',
        ephemeral: true,
      });
      return;
    }
    application.status = 'accepted';
    await applicationRepository.save(application);

    await interaction.reply({
      content: 'Application Accepted',
      ephemeral: true,
    });

    await interaction.channel?.send({
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
}

export default ApplicationAcceptSubCommand;
