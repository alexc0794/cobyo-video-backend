import { Router } from 'express';
import bodyParser from 'body-parser';
import ChatMessageRepository from '../repositories/chat_message_repository';
import { ChatMessage } from '../interfaces/chat';

const DEFAULT_MESSAGE_PAGE_LIMIT = 20;

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/chat/messages', async function(req, res) {
    const before_message_id: string|null = req.query.before_message_id;
    const limit: number = parseInt(req.query.limit || DEFAULT_MESSAGE_PAGE_LIMIT, 10);
    const chat_message_repository = new ChatMessageRepository();
    let before_chat_message: ChatMessage|null = null;
    if (before_message_id) {
      try {
        before_chat_message = await chat_message_repository.get_message(before_message_id);
      } catch {
        console.warn('Couldnt get before chat message', before_chat_message);
      }
    }
    const before_sent_at: string|null = before_chat_message ? before_chat_message.sent_at : null;
    const chat_messages = await chat_message_repository.get_messages(before_sent_at, limit);

    res.send({
      chat_messages
    });
  });

}
