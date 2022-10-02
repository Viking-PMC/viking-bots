import axios from 'axios';
import { Client, Message, TextChannel } from 'discord.js';
import { spookyGifs, spookyWords } from '../schema/spooktober';

const fetchRandomSpoopyGif = async (keyWord: string) => {
  const { data: spoopyData } = await axios.get(
    `https://api.giphy.com/v1/gifs/random?api_key=55QYcopu6tWDpy3uCAFr7S8pRILVVnJp&tag=${keyWord}+halloween&rating=r`
  );

  return spoopyData.data.url;
};

export const sendSpoopyGif = async (
  client: Client<boolean>,
  message: Message<boolean>,
  channelId: string
) => {
  let firstSpoopyKeyWord = spookyWords.find((spoopyWord) =>
    message.content.toLocaleLowerCase().includes(spoopyWord)
  );

  if (firstSpoopyKeyWord) {
    const spoopyChannel = client.channels.cache.get(channelId) as TextChannel;
    message.react('🎃');

    let spoopyGif = await fetchRandomSpoopyGif(firstSpoopyKeyWord);

    if (!spoopyGif) {
      spoopyGif = spookyGifs[~~(Math.random() * spookyGifs.length)];
    }

    spoopyChannel.send({
      content: spoopyGif,
    });
  }
};
