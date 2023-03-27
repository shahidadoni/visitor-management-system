const AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();
var sesclient = new AWS.SES({ region: "us-east-1" });

let response;

exports.handler = async (event, context) => {
  let Body = event;

  if (!Body.sessionId || !Body.token) {
    return {
      statusCode: 422,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "Required fields not found.",
        error: "token and sessionId required",
      }),
    };
  }

  let data = await fetchSessionData(Body.sessionId + "_" + Body.token);
  try {
    if (
      data[0] !== undefined &&
      data[0]["expiryAt"] > Math.floor(new Date().getTime() / 1000)
    ) {
      let device, deviceValue
      if (data[0]["email"]) {
        device = "emailId"
        deviceValue = data[0]["email"]
      }
      else {
        device = "phoneNumber"
        deviceValue = data[0]["phoneNumber"]
      }
      
      let updateReason = await updateReasonDDB(device, deviceValue, Body.reason, Body.concernedPerson);
      let sendNotificationResponse = await sendNotification(Body.concernedPerson, Body.visitorName);
      response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: "Validated",
        }),
      };
    } else {
      response = {
        statusCode: 422,
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: "Cannot validate OTP.",
        }),
      };
    }
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 422,
      headers: {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: "Cannot validate OTP.",
      }),
    };
  }

  return response;
};

async function fetchSessionData(Id) {
  var params = {
    ExpressionAttributeValues: {
      ":Id": Id,
    },
    KeyConditionExpression: "Id = :Id",
    TableName: process.env.DB_TABLE,
  };
  console.log(params);
  let data = await docClient.query(params).promise();

  return data.Items;
}

// Update the reason in the UserTable
async function updateReasonDDB(device, deviceValue, reason, concernedPerson) {
  var params = {
        TableName: process.env.USER_TABLE,
        Key: {
            [device]: {
              S: deviceValue
          }
        },
        UpdateExpression: "set #v1 = :x, #v2 = :y",
        ExpressionAttributeNames: {
            "#v1": "reason", "#v2": "concernedPerson"
        },
        ExpressionAttributeValues: {
            ":x": {
              S: reason},
            ":y": {
              S: concernedPerson}
        }
    };
    if (device === 'phoneNumber') {
      params.IndexName='GSI1'
    }
await dynamodb.updateItem(params).promise();
}



// To send email
async function sendNotification(employeeName, Visitor) {
  var params = {
    ExpressionAttributeValues: {
      ":employeeName": employeeName,
    },
    KeyConditionExpression: "employeeName = :employeeName",
    TableName: process.env.EMP_DB_TABLE,
  };
  console.log(params);
  let employeeDetails = await docClient.query(params).promise();
  let employeeEmail = employeeDetails['Items'][0]["employeeEmail"]
  let subject = "You have a visitor!"
  var body_html = `<html>
                      <head></head>
                      <body>
                      <h1>Rapyder Visitor Managament System</h1>
                        <p>
                          <a> This is email is being sent to notify you that ${Visitor} is waiting for you in the lobby. </a> </p>
                      </body>
                      </html>`;
      const ses_params = {
        Destination: {
            ToAddresses: [employeeEmail],
        },
        Message: {
            Body: {
                Html: { Data: body_html }
            },
            Subject: {
                Data: subject
            },
        },
        Source: process.env.SENDER_EMAIL_ADDRESS
    };
await sesclient.sendEmail(ses_params).promise();
}