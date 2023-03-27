const AWS = require("aws-sdk");
const pinpoint = new AWS.Pinpoint({region : 'us-east-1'});
const crypto = require('crypto');
var docClient = new AWS.DynamoDB.DocumentClient();
var validator = require("email-validator");

let otpExpiryTime = process.env.OTP_EXPIRY_MINUTES;


 
exports.handler = async (event, context) => {
  let Body = event;
  console.log(Body)

  if (!validator.validate(Body.email) && !Body.phoneNumber) {
    return {
      statusCode: 422,
      'headers': {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
      body: JSON.stringify({
        message: "Required field email or phone number not found or invalid",
      }),
    };
  }
  let device, deviceValue
  if (Body.email) {
    device = "email"
    deviceValue = Body.email
  }
  else if (Body.phoneNumber) {
    device = 'phoneNumber'
    deviceValue = Body.phoneNumber
  }
  
  let sessionToken = gerRandomString(32);
  let otp = gerRandomString(process.env.TOKEN_LENGTH, true);

  var params = {
    Item: {
      Id: sessionToken + "_" + otp,
      [device]: deviceValue,
      expiryAt: Math.floor(new Date().getTime() / 1000) + otpExpiryTime * 60,
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.DB_TABLE,
  };

  try {
    await docClient.put(params).promise();
    // OTP params for pinpoint
    if (Body.phoneNumber){
      let destinationN = Body.phoneNumber
      let sms_params = { 
        ApplicationId: process.env.PINPOINT_APPLICATION_ID,
        MessageRequest : { 
            Addresses : {
                [destinationN] : {
                    "ChannelType": "SMS",
                }
    
            },
            MessageConfiguration : {
                SMSMessage: 
                {
                    Body : `This is your One Time Password: ${otp} from Rapyder Cloud Solutions Pvt. Ltd.`,
                    MessageType : "TRANSACTIONAL",
                }
                
            }
        }
      };
      let response = await pinpoint.sendMessages(sms_params).promise();
      
    }else if (Body.email){
      
      console.log("SENDING OTP TO EMAIL...")
      var toAddress = Body.email;
      var subject = "OTP for login";
      var body_text = `This is your One Time Password: ${otp} from Rapyder Cloud Solutions Pvt. Ltd.`;
      var body_html = `<html>
                      <head></head>
                      <body>
                      <h1>Rapyder Cloud Solutions Pvt Ltd</h1>
                        <p>
                          <a> This is your One Time Password: ${otp}. Please don't share. </a> </p>
                      </body>
                      </html>`;
      var charset = "UTF-8";
      // Parameters for email:
      var email_params = {
                  ApplicationId: process.env.PINPOINT_APPLICATION_ID,
                  MessageRequest: {
                    Addresses: {
                      [toAddress]:{
                        ChannelType: 'EMAIL'
                      }
                    },
                    MessageConfiguration: {
                      EmailMessage: {
                        FromAddress: process.env.SENDER_EMAIL_ADDRESS,
                        SimpleEmail: {
                          Subject: {
                            Charset: charset,
                            Data: subject
                          },
                          HtmlPart: {
                            Charset: charset,
                            Data: body_html
                          },
                          TextPart: {
                            Charset: charset,
                            Data: body_text
                          }
                        }
                      }
                    }
                  }
                };
    
    
      
      
      let response = await pinpoint.sendMessages(email_params).promise();
    } 
    return {
      statusCode: 200,
      'headers': {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
      body: JSON.stringify({
        message: "OTP generated",
        data: {
          token: sessionToken,
        },
      }),
    };
  } catch (error) {
    console.error("Error", error.stack);

    return {
      statusCode: 500,
      'headers': {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
              },
      body: JSON.stringify({
        message: "OTP generation failed",
        error: error.stack,
      }),
    };
  }
};

function gerRandomString(length, onlyNumbers = false) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  if (onlyNumbers === true) {
    var characters = "0123456789";
  }
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}