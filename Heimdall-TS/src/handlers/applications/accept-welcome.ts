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
import { getRanks } from '../../utils/Helpers';

const applicationRepository = AppDataSource.getRepository(Application);

class AcceptWelcomeButtonCommand extends ApplicationsBaseCommand {
  constructor() {
    super('accept-welcome');
  }
  get name(): string {
    return this._name;
  }

  async run(client: Client, interaction: ButtonInteraction<CacheType>) {
    let { guildId, guild, user } = interaction;

    const { applicationConfig, application } = (await this.runApplicationsCheck(
      client,
      interaction,
      {
        createdBy: user.id,
        status: 'accepted',
      }
    )) as { applicationConfig: ApplicationConfig; application: Application };

    if (user.id === application.createdBy) {
      await applicationRepository.update(
        { id: application.id },
        { status: 'accepted' }
      );

      const channel = (await client.channels.fetch(
        application.channelId
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
        content: `${user.tag} Accepted.`,
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

      let ranks: { name: string; value: number }[] = await getRanks();

      const guildRanks = interaction.guild?.roles.cache.filter((role) =>
        ranks.some((r) => r.name === role.name)
      );

      const member = await guild!.members.fetch(user.id);
      member?.roles.add(guildRanks?.find((g) => g.name === ranks[1].name)!);
    } else {
      return interaction.reply({
        content: 'You are not the owner of this application.',
        ephemeral: true,
      });
    }
  }
}

export default AcceptWelcomeButtonCommand;
