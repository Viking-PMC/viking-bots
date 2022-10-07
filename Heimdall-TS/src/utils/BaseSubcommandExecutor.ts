import { Group } from './BaseSlashSubCommand';

class BaseSubCommandExecutor {
  _baseCommand: string;
  _group: Group;
  _name: string;

  constructor(baseCommand: string, group: Group, name: string) {
    this._baseCommand = baseCommand;
    this._group = group;
    this._name = name;
  }

  get baseCommand() {
    return this._baseCommand;
  }

  get group() {
    return this._group;
  }

  get name() {
    return this._name;
  }
}

export default BaseSubCommandExecutor;
