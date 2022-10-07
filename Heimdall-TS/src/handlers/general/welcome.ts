import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseCommand } from '../../utils/BaseCommand';

class WelcomeSlashCommand extends BaseCommand {
  constructor() {
    super('welcome');
  }
  get name(): string {
    return this._name;
  }

  run(client: Client, interaction: ChatInputCommandInteraction<CacheType>) {
    return interaction.reply({
      content: `Welcome`,
    });
  }

  getCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('welcome Command')
      .toJSON();
  }
}

export default WelcomeSlashCommand;
