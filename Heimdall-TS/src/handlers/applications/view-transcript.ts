// Language: typescript
// Class file called ApplicationViewTranscriptSubCommand to view the transcript of an application channel once it's closed.

// Path: Heimdall-TS\src\subcommands

// Compare this snippet from Heimdall-TS\src\subcommands\
import { ButtonInteraction, CacheType, CommandInteraction } from 'discord.js';
import { ClientInt } from '../../utils/ClientInt';
import BaseSubCommandExecutor from '../../utils/BaseSubcommandExecutor';
import { Group } from '../../utils/BaseSlashSubCommand';

class ApplicationViewTranscriptSubCommand extends BaseSubCommandExecutor {
  constructor(baseCommand: string, group: Group) {
    super(baseCommand, group, 'accept');
  }

  async run(_client: ClientInt, interaction: ButtonInteraction<CacheType>) {
    await interaction.reply({
      content: 'This command is not yet implemented.',
      ephemeral: true,
    });
  }
}

export default ApplicationViewTranscriptSubCommand;
