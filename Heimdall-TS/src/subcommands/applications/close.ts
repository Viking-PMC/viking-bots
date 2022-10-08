// Language: typescript
// class file called ApplicationCloseSubCommand to close an application channel and mark in DB as closed.

// Path: Heimdall-TS\src\subcommands\applications\close.ts
// Compare this snippet from Heimdall-TS\src\subcommands\applications\close.ts:
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { ClientInt } from '../../utils/ClientInt';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { Group } from '../../utils/BaseSlashSubCommand';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

export class ApplicationCloseSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'close');
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
        content: 'This channel is not an application channel.',
        ephemeral: true,
      });
      return;
    }
    const channel = await interaction.guild?.channels.fetch(
      application.channelId
    );
    if (!channel) {
      await interaction.reply({
        content: 'Channel not found.',
        ephemeral: true,
      });
      return;
    }
    await channel.delete();
    await applicationRepository.update(
      { channelId: interaction.channelId },
      { status: 'closed' }
    );
    await interaction.reply({
      content: 'Channel closed.',
    });
  }
}

export default ApplicationCloseSubCommand;
