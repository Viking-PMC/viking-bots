// Language: typescript
// Class file called ApplicationDenySubCommand to deny an application channel and mark in DB as denied.

// Path: Heimdall-TS\src\subcommands\applications\deny.ts
// Compare this snippet from Heimdall-TS\src\subcommands\applications\deny.ts:
import { CommandInteraction, GuildTextBasedChannel } from 'discord.js';
import { ClientInt } from '../../utils/ClientInt';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { Group } from '../../utils/BaseSlashSubCommand';
import { isDefined } from '../../utils/Helpers';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);

const applicationRepository = AppDataSource.getRepository(Application);

const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

export class ApplicationDenySubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'deny');
  }

  async run(client: ClientInt, interaction: CommandInteraction) {
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

    if (application.status !== 'opened') {
      await interaction.reply({
        content: 'This application is already closed',

        ephemeral: true,
      });

      return;
    }

    await applicationRepository.update(
      { channelId: interaction.channelId },
      { status: 'denied' }
    );

    const channel = interaction.channel as GuildTextBasedChannel;

    if (isDefined(client.user)) {
      await channel.edit({
        permissionOverwrites: [
          {
            id: client.user.id,
            allow: ['ViewChannel', 'SendMessages'],
          },
          {
            id: applicationConfig.role,
            allow: ['ViewChannel', 'SendMessages'],
          },
          { id: guildId!, deny: ['ViewChannel'] },
        ],
      });
    }

    await interaction.reply({
      content: 'Application has been denied',
    });
  }
}

export default ApplicationDenySubCommand;
