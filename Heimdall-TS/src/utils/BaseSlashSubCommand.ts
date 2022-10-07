import { Collection } from 'discord.js';

export type Group = {
  name: string;
  subcommands: string[];
};

export class BaseSlashSubCommand {
  _name: string;
  _groups: Group[];
  _groupCommands: Collection<string, any>;
  _subcommands: string[];

  constructor(name: string, groups: Group[], subcommands: string[]) {
    this._name = name;
    this._groups = groups;
    this._subcommands = subcommands;
    this._groupCommands = new Collection();
  }

  get name(): string {
    return this._name;
  }

  get groups(): Group[] {
    return this._groups;
  }

  get groupCommands(): Collection<string, any> {
    return this._groupCommands;
  }

  get subcommands(): string[] {
    return this._subcommands;
  }
}
