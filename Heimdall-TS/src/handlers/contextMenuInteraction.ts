import {
  CacheType,
  Client,
  ContextMenuCommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
} from 'discord.js';
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

const ranks = [
  { key: 'new user', value: 0 },
  { key: 'Trial', value: 1 },
  { key: 'Recruit', value: 2 },
  { key: 'Viking', value: 3 },
  { key: 'Marauder', value: 4 },
  { key: 'Berserker', value: 5 },
  { key: 'Valkyrie', value: 6 },
  { key: 'Vanir', value: 7 },
  { key: 'Aesir', value: 8 },
  { key: 'Hersir', value: 9 },
  { key: 'Jarl', value: 10 },
];
const getRank = (member: GuildMember) => {
  const memberRanks = member.roles.cache.filter((role) =>
    ranks.some((r) => r.key === role.name)
  );

  if (memberRanks.size === 0) return 0;

  let currentHighest = 0;

  memberRanks.forEach((role) => {
    const currentRoleValue = ranks.find((r) => r.key === role.name)?.value!;

    if (currentRoleValue > currentHighest) {
      currentHighest = currentRoleValue;
    }
  });
  return currentHighest;
};

const updateRoles = async (
  interaction: ContextMenuCommandInteraction<CacheType>,
  type: updateRolesType
) => {
  const user = interaction.options.getMember('user') as GuildMember;
  let oldRoleValue: number;

  const guildRanks = interaction.guild?.roles.cache.filter((role) =>
    ranks.some((r) => r.key === role.name)
  );

  oldRoleValue = getRank(user);

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
      (g) => g.name === ranks[oldRoleValue - 1].key
    )!;

    user.roles.add(newRole);
    user.roles.remove(
      guildRanks?.find((g) => g.name === ranks[oldRoleValue].key)!
    );

    await interaction.reply({
      allowedMentions: { roles: [newRole.id] },
      content: `${interaction.options.getMember(
        'user'
      )} has been demoted to ${newRole}`,
      ephemeral: true,
    });
  } else if (type === 'promote') {
    if (oldRoleValue === 3) {
      await interaction.reply({
        content: `This user cannot be promoted any higher.`,
        ephemeral: true,
      });
      return;
    }
    const newRole = guildRanks?.find(
      (g) => g.name === ranks[oldRoleValue + 1].key
    )!;

    user.roles.add(newRole);
    user.roles.remove(
      guildRanks?.find((g) => g.name === ranks[oldRoleValue].key)!
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
