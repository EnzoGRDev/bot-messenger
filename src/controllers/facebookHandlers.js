const request = require('request')
const products = ["top", "remera", "short"]
const prices = {
  top: "150",
  remera: "200",
  short: "120"
}
const questions =["precio", "presio", "cuanto", "cuánto"]
const regexWant = /pre.io|cuanto|\$+/g

// Handles messages events
function handleMessage(sender_psid, received_message) {
  const messageLowed = received_message.text.toLowerCase()
  let response = {}
  const whatWant = handleWhatWant(messageLowed) 

  // Check the message
  if (whatWant.is && whatWant.products.length) {
    response.text = ""
    // Create the payload
    for(let product of whatWant.products){
      response.text += `${product} ${prices[product]} \n`
    }
  
  }else if(whatWant.is && !whatWant.products.length){
    // Create the payload
    response.attachment = {}
    response.attachment.payload = {}
    response.attachment.type = "template"
    response.attachment.payload.template_type = "generic"
    response.attachment.payload.elements = [{
      title: "¿Qué te interesó?",
      subtitle: "Toca un botón para continuar.",
      buttons: products
        .map(prod => ({
          type: "postback",
          title: prod.toUpperCase() + " $" +  prices[prod],
          payload: prod,
        })),
    }]
    
  }
  
  // Sends the response message
  callSendAPI(sender_psid, response); 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  response = { "text": `$${prices[payload]}` }
  
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

   // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
  
}

//Handle What Want
function handleWhatWant(message){
  if (!message) return false
  let messageLowed = message.toLowerCase()

  let wanting = {
    is: false,
    products: []
  }

  wanting.is = regexWant.test(messageLowed) // is the expected message?
  
  for (let product of products){
    if(messageLowed.includes(product)){
      wanting.products.push(product)
    }
  }
  
  return wanting
}

const facebookHandlers = {
  handleMessage,
  handlePostback,
  handleWhatWant,
}

module.exports = facebookHandlers