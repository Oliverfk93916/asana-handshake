
//First pass to get secret

// exports.handler = async (event) => {
//  console.log('this is secret header — — ->' + event.headers['x-hook-secret'])
//  const response = {
//  statusCode: 200,
//  headers: {"x-hook-secret": event.headers['x-hook-secret']},
//  body: JSON.stringify("Hello from Lambda!"),
//  };
//  return response;
// };


//Second Pass to verify

const axios = require('axios')

var crypto = require("crypto");
exports.handler = async (event) => {
 console.log(event)
 const signature = event.headers['x-hook-signature'];
 const hash = crypto.createHmac('sha256', `${process.env.x_hook_secret}`)
 .update(String(event.body))
 .digest('hex');
 
// Check header secret
 if (signature != hash) {
 console.error('Calculated digest does not match digest from API. This event is not trusted. : ' + signature);
 return response = {
 statusCode: 401
 };
 }

const eventBody = JSON.parse(event.body)
const taskGIDs = [];

for (let i = 0; i < eventBody.events.length; i++) {
 taskGIDs.push([eventBody.events[i].parent.gid])
}

for (let i = 0; i < taskGIDs.length ; i ++) {
 let taskStory = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskGIDs[i]}/stories`, {'headers': {'Authorization': `Bearer ${process.env.token}`}})
 let task = await axios.get(`https://app.asana.com/api/1.0/tasks/${taskGIDs[i]}`, {'headers': {'Authorization' : `Bearer ${process.env.token}`}})
 let taskName = task.data.data.name
 let taskMove = taskStory.data.data[taskStory.data.data.length-1].text.slice(16)
 let user = taskStory.data.data[taskStory.data.data.length-1].created_by.name
 await axios.post(`https://hooks.slack.com/services/${process.env.TDC_slack_endpoint}`, {"text": `${user} moved "${taskName}" ${taskMove}`})
}

const response = {
 statusCode: 200
 };
 return response;
};