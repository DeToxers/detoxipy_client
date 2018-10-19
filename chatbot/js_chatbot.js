const tmi = require('tmi.js')
const oauth = process.env.OAUTH
const superagent = require('superagent')
const express = require('express');
const app = express();
const PORT = 3000; 

console.log(oauth)
let stream_id = 'tonkaaaap';  // 'xqcow' 
// Options needed for setting up our ChatBot
let opts = {
  identity: {
    username: 'bubblechatbot',
    password: 'oauth:' + oauth
  },
  channels: [
    stream_id
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
// let stream_id = '';  // the streamer room this bot is tracking. 
stream_count = 0; 
let currsec = {};
let data = {};

// Called every time a message comes in:
async function onMessageHandler (target, context, msg, self) {
  // if (stream_id != context.room_id){
  //   stream_id = context.room_id
  // }
  if (msg[0] !== '!') { // we are ignoring any attempts to send chatbot commands
    let words = msg.split(' ');
    for (let word of words) {
      if (currsec[word]) {currsec[word]++;}
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
  console.log('-----------------------------'); 
  console.log(stream_count);
  console.log('-----------------------------'); 
  stream_count += 1;
  topBubbles = [['placeholder', 1], ['alsoplaceholder', 0]];  // will be a list of {word: weight}
  maxTopBubbles = 5;
  
  // Step 0: Add all new words from currsec
  for (let word in currsec) {
    if (!data[word] && !ignore_words.includes(word)) {
      data[word] = {};
      data[word].weight = 0;
      data[word].queue = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    }
  }
  // Step 1: Update our running data object that tracks decay and growth
  for (let word in data) {
    if (currsec[word]) {
      data[word].weight += currsec[word];
      data[word].queue.unshift(currsec[word]);
    } else {
      data[word].queue.unshift(0);
    }
    data[word].weight -= data[word].queue.pop();
    // Check if this is a candidate for our topBubbles. 
    if (data[word].weight > topBubbles[topBubbles.length-1][1]) {
      if (data[word].weight >= topBubbles[0][1]) {
        topBubbles.unshift([word, data[word].weight])
      } else {  // value is between our min and max of current topBubbles
        for (let i=0; i<topBubbles.length; i++) {
          if (data[word].weight > topBubbles[i][1]) {
            topBubbles.splice(i,0,[word, data[word].weight]);
          }
        }  // end for loop
      }
      if (topBubbles.length > maxTopBubbles) {
        topBubbles.pop(); 
      }               
    } // end updating with a new topBubbles item
    // if (data[word].weight < 1) {data[word] = undefined}
  }  // end for loop processing all words in data

  // Step 2: POST request to the backend the cummulative total for long-term visualization
  if (currsec !== {}) {
    data_package = JSON.stringify({'vals': currsec, 'room_id': stream_id})
    // console.log(data_package)
    // Does the following post to API route?
    // await superagent.post(server)
    // .send(data_package)
    // .then(data => {
    //   currsec = {}
    // })
    // .catch(err => {
    //   console.error("Unable to reach api endpoint", err)
    // });
    // console.log(data_package);
    currsec = {};  // comment this out when routes work. 
  }
  // Step 3: Call our Render function with our topBubbles (using D3 to live update the chat bubbles)
  render_bubbles(topBubbles)
  // render_bubbles({'room_id': stream_id, 'vals': topBubbles});
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
setInterval(process_data, 1000);4

app.get('/bubbles', (req, res) => {
  json_messages = JSON.stringify(topBubbles)
  res.setHeader('Content-Type', 'application/json');
  res.send(json_messages);
})

app.listen(PORT, () => console.log('server started on port ${PORT}'));
