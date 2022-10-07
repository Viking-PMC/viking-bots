import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  Client,
  GuildTextBasedChannel,
} from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { BaseCommand } from '../../utils/BaseCommand';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class CloseApplicationButtonCommand extends BaseCommand {
  constructor() {
    super('close-application');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild, user } = interaction;

    if (!guildId || !guild) {
      return interaction.reply({
        content: 'Please use this command in a guild.',
        ephemeral: true,
      });
    }

    const guildConfig = await guildConfigRepository.findOneBy({ guildId });
    if (!guildConfig) {
      return interaction.reply({
        content: 'Please register the guild first.',
        ephemeral: true,
      });
    }

    const applicationConfig = await applicationConfigRepository.findOneBy({
      guildId,
    });
    if (!applicationConfig) {
      return interaction.reply({
        content: 'Application plugin is not registered.',
        ephemeral: true,
      });
    }
    if (!applicationConfig.enabled) {
      return interaction.reply({
        content: 'Application plugin is not enabled.',
        ephemeral: true,
      });
    }

    const application = await applicationRepository.findOneBy({
      createdBy: user.id,
      status: 'opened',
    });
    if (!application) {
      return interaction.reply({
        content: 'You do not have an open application.',
        ephemeral: true,
      });
    }

    const channel = guild.channels.cache.get(
      applicationConfig.channelId
    ) as GuildTextBasedChannel;
    if (!channel) {
      return interaction.reply({
        content: 'Application channel is not found.',
        ephemeral: true,
      });
    }

    channel.delete();
    await applicationRepository.update(application.id, {
      status: 'closed',
    });

    return interaction.reply({
      content: 'Your application has been closed.',
      ephemeral: true,
    });
  }
}

export default CloseApplicationButtonCommand;
