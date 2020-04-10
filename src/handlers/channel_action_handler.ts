
export default async function channel_action_handler(event, context, callback) {
  console.log(event, context);
  return callback(null, { statusCode: 200 });
}
