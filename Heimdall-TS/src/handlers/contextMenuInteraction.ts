import {
  CacheType,
  Client,
  ContextMenuCommandInteraction,
  GuildMember,
  GuildMemberRoleManager,
  PermissionsBitField,
  Role,
} from 'discord.js';
import { RolesCache, updateRolesType } from '../utils/Types';

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

const rolesCache: RolesCache = {};
rolesCache['new user'] = { promote: '1002971376845594674', demote: null };
rolesCache['trial'] = {
  promote: '1009252378341539951',
  demote: '1002971301130014790',
};

const updateRoles = async (
  interaction: ContextMenuCommandInteraction<CacheType>,
  rCache: RolesCache,
  type: updateRolesType
) => {
  const user = interaction.options.getMember('user') as GuildMember;
  let oldRole: Role | null = null;
  let promote: string | null = null;
  let demote: string | null = null;
  const BreakError = {};

  try {
    user.roles.cache.forEach((role) => {
      switch (role.name) {
        case 'new user': {
          oldRole = role;
          promote = rCache['new user'].promote;
          throw BreakError;
        }
        case 'trial': {
          oldRole = role;
          promote = rCache['trial'].promote;
          demote = rCache['trial'].demote;
          throw BreakError;
        }
      }
    });
  } catch (error) {
    if (error !== BreakError) {
      console.log(error);
      await interaction.reply({
        content: 'There was an error promoting the user.',
        ephemeral: true,
      });
    }
  }
  if (!oldRole) {
    await interaction.reply({
      content: `The user had no applicable role.`,
      ephemeral: true,
    });
    return;
  }
  if (type === 'demote' && demote) {
    user.roles.add(demote);
    user.roles.remove(oldRole);
    await interaction.reply({
      allowedMentions: { roles: [demote] },
      content: `${interaction.options.getMember(
        'user'
      )} has been demoted to <@&${demote}>`,
      ephemeral: true,
    });
  } else if (type === 'promote' && promote) {
    user.roles.add(promote);
    user.roles.remove(oldRole);
    await interaction.reply({
      allowedMentions: { roles: [promote] },
      content: `${interaction.options.getMember(
        'user'
      )} has been promoted to <@&${promote}>`,
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
      if (checkIfRoleOrAdmin(interaction, 'Personnel')) {
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
      if (checkIfRoleOrAdmin(interaction, 'Personnel')) {
        await interaction.reply({
          content: `You aren't authorised to use that command!`,
          ephemeral: true,
        });
        return;
      }
      updateRoles(interaction, rolesCache, interaction.commandName);
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
