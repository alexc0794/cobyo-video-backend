import { Router } from 'express';
import bodyParser from 'body-parser';
import TranscriptRepository from '../repositories/transcript_repository';

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/transcript', async function(req, res) {
    const table_id: string = req.body.table_id;
    const body: string = req.body.body;
    const saved = await (new TranscriptRepository()).save_transcript(
      table_id,
      body
    );
    res.send(saved);
  });

  // Maybe authenticate?
  app.get('/table/:table_id/keywords', async function(req, res) {
    const table_id: string = req.params.table_id;
    const min_frequency: number = req.query.min_frequency || 3;
    const min_word_length: number = req.query.min_word_length || 5;
    const transcripts = await (new TranscriptRepository()).get_transcripts_by_table_id(table_id);
    const dictionary = {};
    // TODO: Optimize by using min-heap or trie
    transcripts.forEach(transcript => {
      const words = transcript.body.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.length < min_word_length) { // Word must be min_word_length letters or more
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

    const all_words = Object.keys(dictionary).map(word => [word, dictionary[word]]);
    const filtered_words = all_words.filter(entry => entry[1] >= min_frequency);
    filtered_words.sort(function(a, b) {
      return b[1] - a[1];
    });

    const keywords = {};
    filtered_words.slice(0, 10).forEach(entry => {
      keywords[entry[0]] = entry[1];
    });
    res.send(keywords);
  });

}
