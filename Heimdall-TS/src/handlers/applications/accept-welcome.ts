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
import { getRanks } from '../../utils/Helpers';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);
const guildConfigRepository = AppDataSource.getRepository(GuildConfig);

class AcceptWelcomeButtonCommand extends BaseCommand {
  constructor() {
    super('accept-welcome');
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
      console.log('Application not found');
      return;
    }

    if (user.id === application.createdBy) {
      await applicationRepository.update(
        { id: application.id },
        { status: 'accepted' }
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
          { deny: ['ViewChannel', 'SendMessages'], id: guildId },
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

      const member = await guild.members.fetch(user.id);
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
