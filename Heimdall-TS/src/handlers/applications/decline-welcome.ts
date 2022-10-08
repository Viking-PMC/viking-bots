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
import ApplicationsBaseCommand from '../../utils/ApplicationsBaseCommand';

const applicationRepository = AppDataSource.getRepository(Application);

class DeclineWelcomeButtonCommand extends ApplicationsBaseCommand {
  constructor() {
    super('decline-welcome');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    const { guildId, guild, user } = interaction;

    const { applicationConfig, application } = (await this.runApplicationsCheck(
      client,
      interaction,
      {
        createdBy: user.id,
        status: 'opened',
      }
    )) as { applicationConfig: ApplicationConfig; application: Application };

    if (user.id === application.createdBy) {
      await applicationRepository.update(
        { id: application.id },
        { status: 'denied' }
      );

      const channel = (await client.channels.fetch(
        applicationConfig.channelId
      )) as GuildTextBasedChannel;

      await channel.edit({
        permissionOverwrites: [
          {
            allow: ['ViewChannel', 'SendMessages'],
            id: applicationConfig.role,
          },
          { allow: ['ViewChannel', 'SendMessages'], id: client.user!.id },
          { deny: ['ViewChannel', 'SendMessages'], id: guildId! },
        ],
      });
      await channel.send({
        content: `${user.tag} Declined to join.`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('close-application')
              .setStyle(ButtonStyle.Danger)
              .setLabel('Close Room')
              .setEmoji('🎟')
          ),
        ],
      });
      await interaction.reply({
        content: 'Processing...',
      });
      await interaction.deleteReply();

      //kick the user
      const member = await guild!.members.fetch(user.id);
      await member.kick('Declined to join');

      member.send({
        content:
          'You have been kicked from the server, following your decline to join. If you change your mind, you can rejoin the server and reapply.',
      });
    } else {
      return interaction.reply({
        content: 'You are not the owner of this application.',
        ephemeral: true,
      });
    }
  }
}

export default DeclineWelcomeButtonCommand;
