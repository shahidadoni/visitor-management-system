import json
import boto3
import os

client = boto3.client('dynamodb')
table_name = os.environ['TableName']

def lambda_handler(event, context):
    # TODO implement
    
    print(event)
    
    if "emailId" not in event and "phoneNumber" not in event:
        
        return {
            'statusCode': 422,
            'headers': { "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET" },
            'body': {'message':'Please Enter Email-Id or Mobile Number !!!'}
        }
    
    elif "emailId" in event:
        
        email_response = client.query(
            ExpressionAttributeValues={
                ':v1': {
                    'S': event['emailId'],
                },
            },
            KeyConditionExpression='emailId = :v1',
            TableName=table_name,
        )

        
        item_length = len(email_response['Items'])
        
        if item_length == 0:
            return{
                'statusCode': 422,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message':'User Not Found'}
            }
        else:
            return{
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message': 'User Found',
                    'emailId': email_response['Items'][0]['emailId'],
                    'name' : email_response['Items'][0]['name']
                }
            }
        
    elif "phoneNumber" in event:
        phoneNumber_response = client.query(
            ExpressionAttributeValues={
                ':v1': {
                    'S': event['phoneNumber'],
                },
            },
            KeyConditionExpression='phoneNumber = :v1',
            TableName=table_name,
            IndexName='GSI1'
        )
        
        item_length = len(phoneNumber_response['Items'])
        
        if item_length == 0:
            return{
                'statusCode': 422,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message':'User Not Found'}
            }
        else:
            return{
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                'body': {'message':'User Found',
                    'phoneNumber': phoneNumber_response['Items'][0]['phoneNumber'],
                    'name' : phoneNumber_response['Items'][0]['name']
                }
            }
        