import { BaseInteraction, CacheType, Client } from 'discord.js';
import { AppDataSource } from '../typeorm';
import { Application } from '../typeorm/entities/Application';
import { ApplicationConfig } from '../typeorm/entities/ApplicationConfig';
import GuildsBaseCommand from './GuildsBaseCommand';

const applicationConfigRepository =
  AppDataSource.getRepository(ApplicationConfig);
const applicationRepository = AppDataSource.getRepository(Application);

/**
 * Base command for applications.
 * @class
 * @extends GuildsBaseCommand
 *
 * @property {string} _name - The name of the command.
 *
 * @method runApplicationsCheck
 *
 */
class ApplicationsBaseCommand extends GuildsBaseCommand {
  constructor(name: string) {
    super(name);
  }

  /**
   * @method
   * @param {Client} client - The client.
   * @param {BaseInteraction<CacheType>} interaction - The interaction.
   * @param {any} appArgs - The application arguments.
   * @returns {Promise<any>}
   * @async
   * @public
   * @override
   * @memberof ApplicationsBaseCommand
   * @instance
   * @name runApplicationsCheck
   * @description Runs the applications check.
   * @example
   * const { applicationConfig } = await this.runApplicationsCheck(
   *  client,
   * interaction,
   * {
   *  createdBy: user.id,
   * status: 'accepted',
   * }
   * );
   * @example
   * const { applicationConfig, application } = await this.runApplicationsCheck(
   * client,
   * interaction,
   * {
   * createdBy: user.id,
   * status: 'denied',
   * }
   */
  async runApplicationsCheck(
    client: Client,
    interaction: BaseInteraction<CacheType>,
    appArgs: any
  ): Promise<any> {
    const { guildId } = interaction;

    if (!this.runGuildCheck(client, interaction)) {
      return false;
    }
    if (interaction.isRepliable()) {
      const applicationConfig = await applicationConfigRepository.findOneBy({
        guildId: guildId!,
      });
      if (!applicationConfig) {
        interaction.reply({
          content: 'Application plugin is not registered.',
          ephemeral: true,
        });
        return false;
      }
      if (!applicationConfig.enabled) {
        interaction.reply({
          content: 'Application plugin is not enabled.',
          ephemeral: true,
        });
        return false;
      }
      const application = await applicationRepository.findOneBy(appArgs);
      if (!application) {
        return { applicationConfig };
      }
      return { applicationConfig, application };
    }
  }
}

export default ApplicationsBaseCommand;
