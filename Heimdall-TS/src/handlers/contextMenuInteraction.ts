import {
  CacheType,
  Client,
  ContextMenuCommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
} from 'discord.js';
import { getRank, getRanks } from '../utils/Helpers';
import { updateRolesType } from '../utils/Types';

const checkIfRoleOrAdmin = (
  interaction: ContextMenuCommandInteraction,
  role: string
) => {
  const roles = interaction.member?.roles as GuildMemberRoleManager;
  if (
    roles.cache.some((r) => r.name === role) ||
    interaction.memberPermissions?.equals(
      PermissionsBitField.Flags.Administrator
    )
  ) {
    return true;
  }
};

const updateRoles = async (
  interaction: ContextMenuCommandInteraction<CacheType>,
  type: updateRolesType
) => {
  let ranks: { name: string; value: number }[] = await getRanks();
  const user = interaction.options.getMember('user') as GuildMember;
  let oldRoleValue: number;

  const guildRanks = interaction.guild?.roles.cache.filter((role) =>
    ranks.some((r) => r.name === role.name)
  );

  oldRoleValue = await getRank(user, ranks);

  if (oldRoleValue === undefined) {
    await interaction.reply({
      content: `The user had no applicable role.`,
      ephemeral: true,
    });
    return;
  }
  if (type === 'demote') {
    if (oldRoleValue < 1) {
      await interaction.reply({
        content: `This user cannot be demoted any lower.`,
        ephemeral: true,
      });
      return;
    }
    const newRole = guildRanks?.find(
      (g) => g.name === ranks[oldRoleValue - 1].name
    )!;

    user.roles.add(newRole);
    user.roles.remove(
      guildRanks?.find((g) => g.name === ranks[oldRoleValue].name)!
    );

    await interaction.reply({
      allowedMentions: { roles: [newRole.id] },
      content: `${interaction.options.getMember(
        'user'
      )} has been demoted to ${newRole}`,
      ephemeral: true,
    });
  } else if (type === 'promote') {
    if (oldRoleValue === ranks.length - 1) {
      await interaction.reply({
        content: `This user cannot be promoted any higher.`,
        ephemeral: true,
      });
      return;
    }
    const newRole = guildRanks?.find(
      (g) => g.name === ranks[oldRoleValue + 1].name
    )!;

    user.roles.add(newRole);
    user.roles.remove(
      guildRanks?.find((g) => g.name === ranks[oldRoleValue].name)!
    );
    await interaction.reply({
      allowedMentions: { roles: [newRole.id] },
      content: `${interaction.options.getMember(
        'user'
      )} has been promoted to ${newRole}`,
      ephemeral: true,
    });
  }
};

export const handleContextMenuInteraction = async (
  _client: Client,
  interaction: ContextMenuCommandInteraction<CacheType>
) => {
  switch (interaction.commandName) {
    case 'welcome':
      if (!checkIfRoleOrAdmin(interaction, 'Personnel')) {
        await interaction.reply({
          content: `You aren't authorised to use that command!`,
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        content: `Welcome ${interaction.options.getMember('user')}. `,
      });
      break;

    case 'promote':
    case 'demote': {
      if (!checkIfRoleOrAdmin(interaction, 'Personnel')) {
        await interaction.reply({
          content: `You aren't authorised to use that command!`,
          ephemeral: true,
        });
        return;
      }
      updateRoles(interaction, interaction.commandName);

      break;
    }
    default:
      await interaction.reply({
        content: `This command has been registered but no interaction has been assigned. That usually means the command is not available for public use. If you think this is a mistake, please contact Tech.`,
        ephemeral: true,
      });
      break;
  }
};
