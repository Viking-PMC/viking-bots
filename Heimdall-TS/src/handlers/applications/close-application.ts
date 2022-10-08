import {
  ButtonInteraction,
  CacheType,
  Client,
  GuildTextBasedChannel,
} from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { Application } from '../../typeorm/entities/Application';
import { ApplicationConfig } from '../../typeorm/entities/ApplicationConfig';
import ApplicationsBaseCommand from '../../utils/ApplicationsBaseCommand';

const applicationRepository = AppDataSource.getRepository(Application);

class CloseApplicationButtonCommand extends ApplicationsBaseCommand {
  constructor() {
    super('close-application');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guild, user } = interaction;

    const { application } = (await this.runApplicationsCheck(
      client,
      interaction,
      {
        createdBy: user.id,
        status: 'accepted',
      }
    )) as { applicationConfig: ApplicationConfig; application: Application };

    const channel = guild!.channels.cache.get(
      application.channelId
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
