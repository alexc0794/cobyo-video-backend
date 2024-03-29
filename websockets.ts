import WebSocket from 'ws';
import short from 'short-uuid';
import channelConnectionHandler from './src/handlers/channel_connection_handler';
import channelActionHandler from './src/handlers/channel_action_handler';
import { IS_DEV, WS_PORT } from './config';

// if (IS_DEV) {
//   const connections = {};
//
//   const send = (connectionId, data) => {
//     const connection = connections[connectionId];
//     connection.send(JSON.stringify(data));
//   }
//
//   const defaultActions = {
//     connect: (connection) => {
//       const id = short.generate();
//       connection.connectionId = id
//       connections[id] = connection;
//       console.log(`client connected with connectionId: ${id}`);
//       customActions.connect(id);
//     },
//     disconnect: (connectionId) => {
//       delete connections[connectionId];
//       console.log(`client disconnected with connectionId: ${connectionId}`);
//       customActions.disconnect(connectionId);
//     },
//     default: (connection_id, payload) => {
//       console.log('Default handler. You probably did something wrong.', connection_id, payload);
//     },
//   };
//
//   const customActions = {
//     connect: chat_connect,
//     disconnect: chat_disconnect,
//     chat_message: async (connection_id, payload) => {
//       const { message, user_id } = payload;
//       const chat_message = await save_chat_message(message, user_id);
//       if (chat_message) {
//         Object.keys(connections).map(id => {
//           send(id, chat_message);
//         })
//
//       }
//     },
//   };
//
//   const wss = new WebSocket.Server({ port: WS_PORT });
//   wss.on('connection', socket => {
//     defaultActions.connect(socket);
//     socket.on('message', payload_str => {
//       try {
//         const payload = JSON.parse(payload_str);
//         const { action } = payload;
//         // call the matching custom handler, else call the default handler
//         const customHandler = customActions[action];
//         customHandler ? customHandler(socket.connectionId, payload) :
//           defaultActions.default(socket.connectionId, payload);
//       } catch (err) {
//         console.error(err);
//         socket.send(`Bad Request format, use: '{"action": ..., "message": ..., "user_id": ...}'`);
//       }
//     });
//     socket.on('close', () => {
//       defaultActions.disconnect(socket.connectionId);
//     });
//   });
//
//   console.log(`Listening on ws://localhost:${WS_PORT}`);
// }


module.exports.connectionHandler = channelConnectionHandler;
module.exports.defaultHandler = channelActionHandler;
module.exports.channelActionHandler = channelActionHandler;
