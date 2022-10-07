import { ButtonInteraction, CacheType, ChannelType, Client } from 'discord.js';
import { applicationQuestions } from '../../schema/application';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import { GuildConfig } from '../../typeorm/entities/GuildConfig';
import { BaseCommand } from '../../utils/BaseCommand';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class OpenApplicationButtonCommand extends BaseCommand {
  constructor() {
    super('open-application');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild } = interaction;
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
      createdBy: interaction.user.id,
      status: 'opened',
    });
    if (application) {
      return interaction.reply({
        content: 'You already have an open application.',
        ephemeral: true,
      });
    }

    const newApplicationChannel = await guild.channels.create({
      name: `application-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: applicationConfig.categoryId,
      permissionOverwrites: [
        {
          id: guildId,
          deny: ['ViewChannel'],
        },
        {
          id: interaction.user.id,
          allow: ['ViewChannel', 'SendMessages'],
        },
        {
          id: applicationConfig.role,
          allow: ['ViewChannel', 'SendMessages'],
        },
      ],
    });

    const newApplicationMessage = await newApplicationChannel.send({
      content: applicationQuestions,
    });

    const newApplication = new Application();
    newApplication.messageId = newApplicationMessage.id;
    newApplication.channelId = newApplicationChannel.id;
    newApplication.createdBy = interaction.user.id;
    newApplication.status = 'opened';
    await applicationRepository.save(newApplication);

    await interaction.reply({
      content: 'Application created successfully.',
      ephemeral: true,
    });
  }
}

export default OpenApplicationButtonCommand;
