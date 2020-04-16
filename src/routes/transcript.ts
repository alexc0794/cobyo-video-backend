import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Transcript } from '../interfaces/transcript';
import TranscriptRepository from '../repositories/transcript_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/transcript', async function(req: Request, res: Response) {
    const channelId: string = req.body.channelId;
    const body: string = req.body.body;
    const saved: boolean = await (new TranscriptRepository()).saveTranscript(channelId, body);
    return res.sendStatus(saved ? 200 : 500);
  });

  // Maybe authenticate?
  app.get('/table/:channelId/keywords', async function(req: Request, res: Response) {
    const channelId: string = req.params.channelId;
    const minFrequency: number = req.query.minFrequency || 3;
    const minWordLength: number = req.query.minWordLength || 5;
    const transcripts: Array<Transcript> = await (new TranscriptRepository()).getTranscriptsByChannelId(channelId);
    const dictionary = {};
    // TODO: Optimize by using min-heap or trie
    transcripts.forEach((transcript: Transcript) => {
      const words = transcript.body.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.length < minWordLength) { // Word must be minWordLength letters or more
          continue;
        }
        const letters = /^[A-Za-z-]+$/;
        if (!word.match(letters)) { // Word must be alphabetic (no punctuation or numbers). Hyphen allowed
          continue;
        }
        if (word in dictionary) {
          dictionary[word]++;
        } else {
          dictionary[word] = 1;
        }
      }
    });

    const allWords = Object.keys(dictionary).map(word => [word, dictionary[word]]);
    const filteredWords = allWords.filter(entry => entry[1] >= minFrequency);
    filteredWords.sort(function(a, b) {
      return b[1] - a[1];
    });

    const keywords = {};
    filteredWords.slice(0, 10).forEach(entry => {
      keywords[entry[0]] = entry[1];
    });
    res.send(keywords);
  });

}
