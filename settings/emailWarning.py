import requests
import json


def lambda_handler(event, context):
    key = "<insert-your-IFTT-key-here>"
    url = "https://maker.ifttt.com/trigger/email_warning/with/key/" + key

    # Get set of messages from SQS queue
    for record in event['Records']:
        payload = record['body']
        payload = json.loads(str(payload))
        fiscal_code = payload['fiscal_code']
        measure_date = payload['measure_date']
        measured_value = payload['measured_value']
        req = requests.post(url, json={"value1": fiscal_code, "value2": measure_date, "value3": measured_value})
