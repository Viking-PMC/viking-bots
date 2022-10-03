import { Client, Collection } from 'discord.js';

export class ClientInt extends Client {
  public slashCommands: Collection<string, any>;
}
