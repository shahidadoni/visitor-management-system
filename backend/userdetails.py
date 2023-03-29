import json
import boto3
import os
import base64
import six
import uuid
import imghdr
import io

client = boto3.client('dynamodb')
table_name = os.environ['TableName']
s3Bucket = os.environ['s3Bucket']
s3 = boto3.resource('s3')


def lambda_handler(event, context):
    # TODO implement
    
    name = event["name"]
    company = event["company"]
    emailId = event["emailId"]
    phone_number = event["phoneNumber"]
    photograph = event["photograph"]
    
    photograph = photograph[photograph.find(",")+1:] 
    imgdata = base64.b64decode(photograph + "===")
    # file = open(photograph,'rb')
    # imgdata = base64.b64decode(photograph)
    print(imgdata)
    
    try:
        object = s3.Object(s3Bucket,'index/'+name+'.jpeg')
        ret = object.put(Body=io.BytesIO(imgdata),
                        Metadata={'FullName': emailId}
                        )
        response = client.put_item(
            Item={
                'emailId': {
                    'S': emailId,
                },
                'phoneNumber': {
                    'S': phone_number,
                },
                'name': {
                    'S': name,
                },
                'company': {
                    'S': company,
                }
            },
            TableName=table_name,
        )

        print(response)
        
        return{
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message':'User Details Ingested Successfully..'}
            }
    except Exception as e:
        print(e)
        return{
                'statusCode': 422,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message':'User Details Not Ingested!!'}
            }
    
    
    
    
