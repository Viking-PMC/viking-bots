import * as path from 'path';
import * as fs from 'fs';
import { constants } from 'fs';
import { ClientInt } from './ClientInt';
import { Collection } from 'discord.js';

export const registerCommands = async (client: ClientInt, dir = '') => {
  const filePath = path.join(__dirname, dir);
  const files = await fs.promises.readdir(filePath);

  for (const file of files) {
    const stat = await fs.promises.lstat(path.join(filePath, file));
    if (stat.isDirectory())
      await registerCommands(client, path.join(dir, file));
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const Command = await require(path.join(filePath, file)).default;
      const cmd = new Command();
      client.commands.set(cmd.name, cmd);
      console.log(`Registered: ${cmd.name}`);
    }
  }
};

export const registerSubCommands = async (
  client: ClientInt,
  dir = '../subcommands'
): Promise<void> => {
  const filePath = path.join(__dirname, dir);
  const files = await fs.promises.readdir(filePath);

  for (const file of files) {
    const stat = await fs.promises.lstat(path.join(filePath, file));
    if (stat.isDirectory()) {
      const subcommandDirectoryFiles = await fs.promises.readdir(
        path.join(filePath, file)
      );

      const indexFilePos = subcommandDirectoryFiles.indexOf('index.ts');
      subcommandDirectoryFiles.splice(indexFilePos, 1);

      try {
        await fs.promises.access(
          path.join(filePath, file, 'index.ts'),
          constants.F_OK
        );
        let BaseSubcommand = await require(path.join(
          filePath,
          file,
          'index.ts'
        )).default;

        if (!BaseSubcommand) {
          BaseSubcommand = await require(path.join(filePath, file, 'index.js'))
            .default;
        }

        const subcommand = new BaseSubcommand();
        client.slashSubcommands.set(file, subcommand);

        for (const group of subcommand.groups) {
          for (const command of group.subcommands) {
            const SubCommandClass = await require(path.join(
              filePath,
              file,
              group.name,
              command
            )).default;
            let subcommandGroupMap = subcommand.groupCommands.get(group.name);
            if (subcommandGroupMap) {
              subcommandGroupMap.set(
                command,
                new SubCommandClass(file, group.name, command)
              );
            } else {
              subcommandGroupMap = new Collection();
              subcommandGroupMap.set(
                command,
                new SubCommandClass(file, group.name, command)
              );
            }

            subcommand.groupCommands.set(group.name, subcommandGroupMap);
            console.log(`Registered: ${file} > ${group.name} > ${command}`);
          }
          const fileIndex = subcommandDirectoryFiles.indexOf(group.name);
          subcommandDirectoryFiles.splice(fileIndex, 1);
        }
        for (const subcommandFile of subcommandDirectoryFiles) {
          const Subcommand = await require(path.join(
            filePath,
            file,
            subcommandFile
          )).default;
          const cmd = new Subcommand(file, null);
          const subcommandInstance = await client.slashSubcommands.get(file);
          subcommandInstance.groupCommands.set(cmd.name, cmd);
          console.log(`Registered: ${file} > ${cmd.name}`);
        }
        console.log(`----------------------`);
      } catch (error) {
        console.log(error);
      }
    }
  }
};
