/**
 * A base class for all commands.
 * @class BaseCommand
 * @abstract
 * @param {string} name The name of the command.
 *
 * @property {string} name The name of the command.
 *
 * @example
 * ```ts
 * import { BaseCommand } from './utils/BaseCommand';
 *
 * class PingCommand extends BaseCommand {
 *  constructor() {
 *   super('ping');
 * }
 *
 *```
 * @get {string} name The name of the command.
 */
export class BaseCommand {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }
}
