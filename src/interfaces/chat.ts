export interface ChatConnection {
  connection_id: string,
  connected_at: string,
};

export interface ChatMessage {
  message_id: string,
  user_id: string,
  message: string,
  sent_at: string,
}
