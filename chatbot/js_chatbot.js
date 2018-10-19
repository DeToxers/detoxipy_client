const tmi = require('tmi.js')
const oauth = process.env.OAUTH
const request = require('superagent');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; 

app.use(cors());

console.log(oauth)
let stream_id = 'dakotaz';  // 'xqcow' 
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
let currsec = [];


// Called every time a message comes in:
async function onMessageHandler (target, context, msg, self) {
  // if (stream_id != context.room_id){
  //   stream_id = context.room_id
  // }
  if (msg[0] !== '!') { 
    currsec.push(msg)
    // we are ignoring any attempts to send chatbot commands
  }

  data = {'room_id': context['room-id'], 
          'content': currsec}


  request.post('http://localhost:8000/api/v1/chat')
    .send(JSON.stringify(data))
    .then(res => {
      currsec = []
   }).catch(console.error);
   
} 
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}  // end onConnectedHandler
  
// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}  // end onDisconnectedHandler

// The following starts the batch processing of our chat bubbles and data storage
// setInterval(process_data, 1000);