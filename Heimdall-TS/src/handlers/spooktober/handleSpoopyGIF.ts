import { AppDataSource } from '../../typeorm';
import axios from 'axios';
import { Client, Message, TextChannel } from 'discord.js';
import { spookyGifs, spookyWords } from '../../schema/spooktober';
import { SpooktoberConfig } from '../../typeorm/entities/SpooktoberConfig';

const spooktoberConfigRepository =
  AppDataSource.getRepository(SpooktoberConfig);

class HandleSpoopyGIF {
  fetchRandomSpoopyGif = async (keyWord: string) => {
    const { data: spoopyData } = await axios.get(
      `https://api.giphy.com/v1/gifs/random?api_key=55QYcopu6tWDpy3uCAFr7S8pRILVVnJp&tag=${keyWord}+halloween&rating=r`
    );

    return spoopyData.data.url;
  };

  async run(client: Client, message: Message<boolean>, channelId: string) {
    const spooktoberConfig = await spooktoberConfigRepository.findOneBy({
      guildId: message.guild!.id,
    });

    if (!spooktoberConfig || !spooktoberConfig.enabled) return;

    if (spooktoberConfig.blacklist.includes(channelId)) return;

    let firstSpoopyKeyWord = spookyWords.find((spoopyWord) =>
      message.content.toLocaleLowerCase().includes(spoopyWord)
    );

    if (firstSpoopyKeyWord) {
      const spoopyChannel = client.channels.cache.get(channelId) as TextChannel;
      message.react('🎃');

      let spoopyGif = await this.fetchRandomSpoopyGif(firstSpoopyKeyWord);

      if (!spoopyGif) {
        spoopyGif = spookyGifs[~~(Math.random() * spookyGifs.length)];
      }

      spoopyChannel.send({
        content: spoopyGif,
      });
    }
  }
}

export default HandleSpoopyGIF;
