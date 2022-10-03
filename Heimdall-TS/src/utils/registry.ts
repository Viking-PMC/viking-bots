import path from 'path';
import fs from 'fs/promises';
import { ClientInt } from './ClientInt';

export default async function registerCommands(client: ClientInt, dir = '') {
  const filePath = path.join(__dirname, dir);
  const files = await fs.readdir(filePath);

  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerCommands(client, path.join(dir, file));
    if (file.endsWith('.ts')) {
      const command = await import(path.join(filePath, file));
      client.slashCommands.set(command.name, command);
    }
  }
}
