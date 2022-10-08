import { ButtonInteraction, CacheType, ChannelType, Client } from 'discord.js';
import { applicationQuestions } from '../../schema/application';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import ApplicationsBaseCommand from '../../utils/ApplicationsBaseCommand';

const applicationRepository = AppDataSource.getRepository(Application);

class OpenApplicationButtonCommand extends ApplicationsBaseCommand {
  constructor() {
    super('open-application');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild, user } = interaction;

    const { application, applicationConfig } = (await this.runApplicationsCheck(
      client,
      interaction,
      {
        createdBy: user.id,
        status: 'opened',
      }
    )) as { applicationConfig: ApplicationConfig; application: Application };

    if (application) {
      return interaction.reply({
        content: 'You already have an open application.',
        ephemeral: true,
      });
    }

    const newApplicationChannel = await guild!.channels.create({
      name: `application-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: applicationConfig.categoryId,
      permissionOverwrites: [
        {
          id: guildId!,
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
