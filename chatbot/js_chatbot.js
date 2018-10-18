const tmi = require('tmi.js')
const oauth = process.env.OAUTH
const superagent = require('superagent')

console.log(oauth)

// Options needed for setting up our ChatBot
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

// Data Stuff for our Project
ignore_words = ['ourselves', 'hers', 'between', 'yourself', 'but', 'again', 'there', 'about', 'once', 'during', 'out', 'very', 'having', 'with', 'they', 'own', 'an', 'be', 'some', 'for', 'do', 'its', 'yours', 'such', 'into', 'of', 'most', 'itself', 'other', 'off', 'is', 's', 'am', 'or', 'who', 'as', 'from', 'him', 'each', 'the', 'themselves', 'until', 'below', 'are', 'we', 'these', 'your', 'his', 'through', 'don', 'nor', 'me', 'were', 'her', 'more', 'himself', 'this', 'down', 'should', 'our', 'their', 'while', 'above', 'both', 'up', 'to', 'ours', 'had', 'she', 'all', 'no', 'when', 'at', 'any', 'before', 'them', 'same', 'and', 'been', 'have', 'in', 'will', 'on', 'does', 'yourselves', 'then', 'that', 'because', 'what', 'over', 'why', 'so', 'can', 'did', 'not', 'now', 'under', 'he', 'you', 'herself', 'has', 'just', 'where', 'too', 'only', 'myself', 'which', 'those', 'i', 'after', 'few', 'whom', 't', 'being', 'if', 'theirs', 'my', 'against', 'a', 'by', 'doing', 'it', 'how', 'further', 'was', 'here', 'than']
server = 'http://twitchbubblechat.com/api/v1/chat'
let stream_id = '';  // the streamer room this bot is tracking. 
let currsec = {};
let data = {};

// Called every time a message comes in:
async function onMessageHandler (target, context, msg, self) {
  if (stream_id != context.room_id){
    stream_id = context.room_id
  }
  if (msg[0] !== '!') { // we are ignoring any attempts to send chatbot commands
    let words = msg.split(' ');
    for (let word of words) {
      if (currsec[word]) { currsec[word]++}
      else {currsec[word] = 1;}
    }
  }
}  // end onMessageHandler

async function process_data() {
  // Docstring: This function calls itself recursively every (1 sec). 
  // It does 3 things: 
  // 1) Update the local object holding our bubble data
  // 2) PUT/POST to the backend for long term tracking of cummulative total on data
  // 3) call the render function (which uses D3 to make the live chat bubbles)
  // End Docstring  

  // Step 1: Update our running data object that tracks decay and growth
  for (let word in currsec) {
    if (!ignore_words.includes(word)) {  // skip if this word is in our ignore_words
      if (data[word]) {
        data[word].weight += currsec[word];
        data[word].queue.unshift(currsec[word]);
        data[word].weight -= data[word].queue.pop();
      } else {
        data[word] = {};
        data[word].weight = currsec[word];
        data[word].queue = [currsec[word]];
        data[word].queue.fill(0,1,29);
      }
    }  // only processed words not in our ignore_words list
  }  // end for loop

  // Step 2: POST request to the backend the cummulative total for long-term visualization
  if (currsec !== {}) {
    data_package = JSON.stringify({'vals': currsec, 'room_id': stream_id})
    // console.log(data_package)
    // Does the following post to API route?
    await superagent.post(server)
    .send(data_package)
    .then(data => {
      currsec = {}
    })
    .catch(err => {
      console.error("Unable to reach api endpoint", err)
    });
  }

  // Step 3: Call our Render function (using D3 to live update the chat bubbles)
  bubble_info = []
  for (key in data) { 
    bubble_info.push({key: data[key].weight}); 
  }
  render_bubbles({'room_id': stream_id, 'vals': bubble_info});

}  // end process_data


function render_bubbles(bubble_package) {
  // call our D3 render function
  console.log(bubble_package)
}  // end render_bubbles

// Called on connecting to Twitch chat: 
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}  // end onConnectedHandler
  
// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}  // end onDisconnectedHandler

// The following starts the batch processing of our chat bubbles and data storage
setInterval(process_data, 1000);