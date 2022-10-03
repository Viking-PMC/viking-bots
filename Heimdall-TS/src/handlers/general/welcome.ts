import { CacheType, ChatInputCommandInteraction, Client } from 'discord.js';
import { BaseSlashCommand } from '../../utils/BaseSlashCommand';

export class WelcomeSlashCommand extends BaseSlashCommand {
  constructor() {
    super('welcome');
  }

  run(client: Client, interaction: ChatInputCommandInteraction<CacheType>) {
    return interaction.reply({
      content: `Welcome`,
    });
  }
}
