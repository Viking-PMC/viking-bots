import { Client, Collection } from 'discord.js';

export class ClientInt extends Client {
  commands: Collection<string, any>;
  slashSubcommands: Collection<string, any>;
  constructor(options: any) {
    super(options);
    this.commands = new Collection();
    this.slashSubcommands = new Collection();
  }
}
