import json
import boto3
import os

client = boto3.client('dynamodb')
table_name = os.environ['TableName']

def lambda_handler(event, context):
    # TODO implement
    
    name = event["name"]
    company = event["company"]
    emailId = event["emailId"]
    phone_number = event["phoneNumber"]
    photograph = event["photograph"]
    
    try:
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
                },
                'photograph': {
                    'S': photograph,
                },
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
    
    
    
    