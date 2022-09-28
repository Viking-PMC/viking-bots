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

export const getRank = async (
  member: GuildMember,
  ranks: { name: string; value: number }[]
) => {
  const memberRanks = member.roles.cache.filter((role) =>
    ranks.some((r) => r.name === role.name)
  );

  if (memberRanks.size === 0) return 0;

  let currentHighest = 0;

  memberRanks.forEach((role) => {
    const roleValue = ranks.find((r) => r.name === role.name)?.value!;

    if (roleValue > currentHighest) {
      currentHighest = roleValue;
    }
  });
  return currentHighest;
};
