import { CommandInteraction } from 'discord.js';
import { AppDataSource } from '../../typeorm';
import { SpooktoberConfig } from '../../typeorm/entities/SpooktoberConfig';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);

/**
 *
 * @param interaction - The interaction to get the spooktober config of
 * @returns  - void
 *
 */
export const spooktoberStatus = async (interaction: CommandInteraction) => {
  const { guildId } = interaction;
  const spooktoberConfig = await spooktoberConfigRepository.findOneBy({
    guildId: guildId!,
  });
  if (!spooktoberConfig) {
    await interaction.reply({
      content: 'Spooktober plugin is not registered.',
      ephemeral: true,
    });
    return;
  }
  if (spooktoberConfig.enabled) {
    await interaction.reply({
      content: 'Spooktober plugin is enabled',
      ephemeral: true,
    });
    return;
  }
  await interaction.reply({
    content: 'Spooktober plugin is not enabled',
    ephemeral: true,
  });
};
