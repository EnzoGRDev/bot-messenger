require('dotenv').config();

const express = require('express');

const app = express();

const cors = require('cors');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const request = require('request');

const products = ["top", "remera", "short"];
const prices = {
  top: "150",
  remera: "200",
  short: "120"
};
const questions = ["precio", "presio", "cuanto", "cuánto"];
app.use(cors({
  origin: "*"
}));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json()); //Handle What Want

function handleWhatWant(message) {
  if (!message) return false;
  let wanting = {};
  questions.find(quest => message.includes(quest) ? wanting.is = true : "");
  products.forEach(product => message.includes(product) ? wanting.products += ` ${product}` : "");

  if (wanting.products) {
    wanting.products = wanting.products.split(" ");
    if (wanting.products && wanting.products.includes("undefined")) wanting.products.shift();
  }

  return wanting.is || wanting.products ? wanting : false;
} // Handles messages events


function handleMessage(sender_psid, received_message) {
  const messageLowed = received_message.text.toLowerCase();
  let response;
  const whatWant = handleWhatWant(messageLowed); // Check the message

  if (whatWant.is && whatWant.products) {
    // Create the payload
    if (whatWant.products.length === 1) {
      let prod = whatWant.products[0];
      response = `${prod} $${prices[prod]}`;
    } else if (whatWant.products.length === 2) {
      let prod = whatWant.products[0];
      let prodTwo = whatWant.products[1];
      response = `${prod} $${prices[prod]} y ${prodTwo} $${prices[prodTwo]}`;
    }
  } else if (whatWant.is && !whatWant.products) {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "buttons": products.map(prod => ({
              "type": "postback",
              "title": prod[0].toUpperCase() + prod.slice(1),
              "payload": prod
            }))
          }]
        }
      }
    };
  } // Sends the response message


  callSendAPI(sender_psid, response);
} // Handles messaging_postbacks events


function handlePostback(sender_psid, received_postback) {
  let response; // Get the payload for the postback

  let payload = received_postback.payload; // Set the response based on the postback payload

  response = {
    "text": `$${prices[payload]}`
  }; // Send the message to acknowledge the postback

  callSendAPI(sender_psid, response);
} // Sends response messages via the Send API


function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }; // Send the HTTP request to the Messenger Platform

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": process.env.PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
} // Creates the endpoint for our webhook 


app.post('/webhook', (req, res) => {
  let body = req.body; // Checks this is an event from a page subscription

  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event); // Get the sender PSID

      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid); // Check if the event is a message or postback and
      // pass the event to the appropriate handler function

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    }); // Returns a '200 OK' response to all requests

    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
}); // Adds support for GET requests to our webhook

app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.ACCESS_TOKEN; // Parse the query params

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge']; // Checks if a token and mode is in the query string of the request

  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
const port = process.env.PORT || 3001;
app.listen(port, () => console.log('server listen in PORT ', port));