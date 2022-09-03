import 'reflect-metadata';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import 'dotenv/config';

const { BOT_TOKEN, GUILD_ID } = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
});

client.on('ready', () => console.log(`${client.user?.tag} logged in`));

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  let member = newPresence.member!;
  let channel = client.channels.cache.get('316197700989222912') as TextChannel;
  let text = '';
  try {
    if (
      member?.user.bot &&
      member.guild.id === GUILD_ID &&
      oldPresence?.status !== newPresence.status
    ) {
      if (member?.presence?.status === 'online') {
        text = `<@&671462457721487373> | <@${member.user.id}> is back online`;
      } else if (member?.presence?.status === 'offline') {
        text = `<@&671462457721487373> | <@${member.user.id}> is offline`;
      } else {
        return;
      }
      await channel.send(text);
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
