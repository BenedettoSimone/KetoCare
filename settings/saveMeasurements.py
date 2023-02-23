import json
import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

table = dynamodb.Table('Measurements')


def lambda_handler(event, context):

     for record in event['Records']:
        payload = record['body']
        payload = json.loads(str(payload))

        device_id = payload['device_id']
        measure_date = payload['measure_date']
        fiscal_code = payload['fiscal_code']
        measured_value = payload['measured_value']

        item = {
            'fiscal_code': fiscal_code,
            'timestamp': measure_date,
            'device_id': device_id,
            'measured_value': measured_value
        }
        table.put_item(Item=item)

