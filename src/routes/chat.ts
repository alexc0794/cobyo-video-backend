import { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ChatMessage } from '../interfaces';
import ChatMessageRepository from '../repositories/chat_message_repository';

const DEFAULT_MESSAGE_PAGE_LIMIT = 20;

export default (app: Router) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  type GetChatMessagesResponse = {
    chatMessages: Array<ChatMessage>,
  };

  app.get('/chat/messages', async function(req: Request, res: Response) {
    const beforeMessageId: string|null = req.query.beforeMessageId || null;
    const limit: number = parseInt(req.query.limit || DEFAULT_MESSAGE_PAGE_LIMIT, 10);
    const chatMessageRepository = new ChatMessageRepository();
    let beforeChatMessage: ChatMessage|null = null;

    if (beforeMessageId) {
      try {
        beforeChatMessage = await chatMessageRepository.getMessage(beforeMessageId);
      } catch {
        beforeChatMessage = null;
      }
    }
    const beforeSentAt = beforeChatMessage ? beforeChatMessage.sentAt : (new Date()).toISOString();
    const chatMessages: Array<ChatMessage> = await chatMessageRepository.getMessages(beforeSentAt, limit);

    const response: GetChatMessagesResponse = { chatMessages };
    res.send(response);
  });

}
