import 'reflect-metadata';
import {
  APIEmbed,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  TextChannel,
} from 'discord.js';
import 'dotenv/config';

const { BOT_TOKEN, GUILD_ID } = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
});

client.on('ready', () => console.log(`${client.user?.tag} logged in`));

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  let member = newPresence.member!;
  let channel = client.channels.cache.get('1022895469283790958') as TextChannel;
  let text: string;
  let embeds: APIEmbed[] = [];
  try {
    if (
      member?.user.bot &&
      member.guild.id === GUILD_ID &&
      oldPresence?.status !== newPresence.status
    ) {
      if (member?.presence?.status === 'online') {
        text = '';
        embeds = [
          new EmbedBuilder()
            .setAuthor({
              name: 'Bot Online',
            })
            .setTimestamp()
            .setColor(0x2ecc71)
            .setTimestamp(new Date())
            .setDescription(`<@${member.user.id}>`)
            .addFields({
              name: 'Name:',
              value: member.displayName,
              inline: true,
            })
            .setThumbnail(member.user.displayAvatarURL())
            .toJSON(),
        ];
      } else if (member?.presence?.status === 'offline') {
        text = `<@&405408875295277072>`;
        embeds = [
          new EmbedBuilder()
            .setAuthor({
              name: 'Bot Offline',
            })
            .setTimestamp()
            .setColor(0xf44336)
            .setTimestamp(new Date())
            .setDescription(`<@${member.user.id}>`)
            .addFields({
              name: 'Name:',
              value: member.displayName,
              inline: true,
            })
            .setThumbnail(member.user.displayAvatarURL())
            .toJSON(),
        ];
      } else {
        return;
      }
      await channel.send({ content: text, embeds: embeds });
    }
  } catch (error) {
    console.log(error);
    channel.send('An error occurred while watching for presence updates.');
  }
});

const main = async () => {
  try {
    await client.login(BOT_TOKEN);
  } catch (error) {
    console.error(error);
  }
};
main();
