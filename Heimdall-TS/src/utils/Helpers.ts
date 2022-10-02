import { GuildMember } from 'discord.js';
import { AppDataSource } from '../typeorm';
import { Rank } from '../typeorm/entities/Rank';

const ranksRepository = AppDataSource.getRepository(Rank);

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return typeof value !== null || value !== undefined;
};
export const getRanks = async (): Promise<Rank[]> => {
  const ranks = await ranksRepository.find();
  ranks.sort((a, b) => a.value - b.value);
  return ranks;
};

/**
 * a function to get the rank of a user.
 * @param member - The member to get the rank of
 * @param ranks - The ranks to check against
 * @returns - The value of the rank the member has
 * @example
 * const ranks = await getRanks();
 * const rank = await getRank(member, ranks);
 * console.log(rank);
 * // 1
 * @example
 * const ranks = await getRanks();
 * const rank = await getRank(member, ranks);
 * console.log(rank);
 * // undefined
 * @example
 * const ranks = await getRanks();
 * const rank = await getRank(member, ranks);
 * console.log(rank);
 * // 0
 * @example
 * const ranks = await getRanks();
 * const rank = await getRank(member, ranks);
 * console.log(rank);
 * // 2
 */
// Language: typescript
export const getRank = async (member: GuildMember, ranks: Rank[]) => {
  const memberRanks = member.roles.cache.filter((role) =>
    ranks.some((r) => r.name === role.name)
  );
  if (memberRanks.size === 0) {
    return 0;
  }
  let highestRank = 0;
  memberRanks.forEach((role) => {
    const rank = ranks.find((r) => r.name === role.name);
    if (rank === undefined) {
      return undefined;
    }
    if (rank.value > highestRank) {
      highestRank = rank.value;
    }
  });
  return highestRank;
};

// Language: typescript
//function to find the newest member in the guild
export const getNewestMember = (members: GuildMember[]) => {
  let newestMember = members[0];
  members.forEach((member) => {
    if (member.joinedAt! > newestMember.joinedAt!) {
      newestMember = member;
    }
  });
  return newestMember;
};
