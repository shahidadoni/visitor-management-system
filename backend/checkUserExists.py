import json
import boto3
import os
import io
import base64

client = boto3.client('dynamodb')
table_name = os.environ['TableName']
rekognition = boto3.client('rekognition', region_name='us-west-1')
dynamodb = boto3.client('dynamodb', region_name='us-west-1')
faceTable = os.environ['RVMSFaceTable']

def lambda_handler(event, context):
    # TODO implement
    
    print(event)
    
    if "emailId" not in event and "phoneNumber" not in event and "faceImage" not in event:
        
        return {
            'statusCode': 422,
            'headers': { "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET" },
            'body': {'message':'Please Enter Email-Id, Mobile Number or upload a photo !!!'}
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
    elif "faceImage" in event:
        face_emailId = ""
        photograph = event["faceImage"]
        photograph = photograph[photograph.find(",")+1:] 
        imgdata = base64.b64decode(photograph + "===")
        Body=io.BytesIO(imgdata)
        image_binary = Body.getvalue()
        response = rekognition.search_faces_by_image(
                CollectionId='rvms_collection',
                Image={'Bytes':image_binary}                                       
                )
            
        for match in response['FaceMatches']:
            print (match['Face']['FaceId'],match['Face']['Confidence'])
                
            face = dynamodb.get_item(
                TableName=faceTable,  
                Key={'RekognitionId': {'S': match['Face']['FaceId']}}
                )
            
            if 'Item' in face:
                face_emailId = face['Item']['FullName']['S']
                # print (face_emailId)
            else:
                print ('no match found in person lookup')
        print(face_emailId)  
        face_response = client.query(
            ExpressionAttributeValues={
                ':v1': {
                    'S': face_emailId,
                },
            },
            KeyConditionExpression='emailId = :v1',
            TableName=table_name,
        )

        
        item_length = len(face_response['Items'])
        
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
                    'emailId': face_response['Items'][0]['emailId'],
                    'name' : face_response['Items'][0]['name']
                }
            }
