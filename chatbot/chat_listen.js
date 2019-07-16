const tmi = require('tmi.js')
const oauth = process.env.OAUTH
const superagent = require('superagent')



console.log(oauth)

let messages = []
let stream_id = ''

let opts = {
  identity: {
    username: 'bubblechatbot',
    password: 'oauth:' + oauth
  },
  channels: [
    'xqcow'
  ]
}
// Create a client with our options:
let client = new tmi.client(opts)

// Register our event handlers (defined below):
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time a message comes in:
async function onMessageHandler (target, context, msg, self) {
  if (stream_id != context.room_id){
    stream_id = context.room_id
  }
  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1)) {
    messages.push(msg)
    // console.log(messages)
    return
  }
}

async function runApiLoop(){
  if (messages !== []) {
    // console.log(messages)
    // Does the following post to API route?
    await superagent.post('http://twitchbubblechat.com/api/v1/chat')
      .send(JSON.stringify({
        vals: messages,
        room_id: stream_id
      }))
      .then(data => {
        messages = []
        setTimeout(() => {
          runApiLoop()
        }, 1000);
      })
      .catch(err => {
        console.error("Unable to reach api endpoint", err)
      })
  }
  console.log('Posted ')
  // messages = []
  // setTimeout(() => {
  //         runApiLoop()
  //       }, 1000);
  //  ------------------------------

} // end runApiLoop

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}

runApiLoop()