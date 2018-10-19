// const tmi = require('tmi.js')



// Options needed for setting up our ChatBot
let opts = {
  identity: {
    username: 'bubblechatbot',
    password: 'oauth:i3gat9eybjj9aitc45uu4w4txb7j0h'
  },
  channels: [
    'xqcow'
  ]
}

var top_five = [
  ['null', 0],
  ['null', 0],
  ['null', 0],
  ['null', 0],
  ['null', 0],
]

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

  d_three_return = []

  // Step 1: Update our running data object that tracks decay and growth
  for (let word in currsec) {
    if (!ignore_words.includes(word) && data[word] == undefined) {
      empty_array = []
      for (var i=0; i < 30; i++){
        empty_array.push(0)
      }
      data[word] = {'queue': empty_array,
      'total': 0,
      'word': word}
    }
  }
  for (let word in data){
    var new_val = 0
    if (currsec[word] != undefined){
      new_val = currsec[word]
      
    }
    data[word].queue.unshift(new_val)
    data[word].total += new_val
    data[word].total -= data[word].queue.pop()
    
    let lowest = 0
    for (let i=0; i < top_five.length; i++){
      if (top_five[i][1] < top_five[lowest][1]){
        lowest = i
      }
    }
    if (data[word].total > top_five[lowest][1]){
      top_five[lowest] = [data[word].word, data[word].total]
    }
  }
  
  for (word_arr in top_five){
    formatted_top_five = {'name': top_five[word_arr][0], 'size': top_five[word_arr][1]}
    d_three_return.push(formatted_top_five)
  }

  render_bubbles(d_three_return)

  
  // skip if this word is in our ignore_words
  //     if (data[word] !== undefined) {
    //       data[word].weight += currsec[word];
    //       data[word].queue.unshift(currsec[word]);
    //       data[word].weight -= data[word].queue.pop();
    //       console.log(data[word].queue)
    //     } else {
      //       data[word] = {};
      //       data[word].weight = currsec[word];
      //       data[word].queue = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      //       // data[word].queue.apply(null, Array(29)).map(Number.prototype.valueOf,0);
      //       data[word].queue.unshift(currsec[word]);
      //     }
      //   }  // only processed words not in our ignore_words list
      // }  // end for loop
      
      // Step 2: POST request to the backend the cummulative total for long-term visualization

        // console.log(data_package)
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
    currsec = {}
}

  // Step 3: Call our Render function (using D3 to live update the chat bubbles)

  // end process_data


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