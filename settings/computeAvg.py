import boto3
import datetime
import statistics

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
measurements_table = dynamodb.Table('Measurements')
averages_table = dynamodb.Table('Averages')


def lambda_handler(event, context):
    # get these information from Patient table
    patients = [('01', 'CGLSZV61B26A832H'),
                ('02', 'TGHCNE68P03C166P'),
                ('03', 'HQCQGX75E04D233U'),
                ('04', 'DMCNJS43M44B320A'),
                ('05', 'RMTPYV37C30C865B')]

    current_date = datetime.datetime.now().strftime("%Y-%m-%d")

    for device_id, fiscal_code in patients:
        values = []
        response = measurements_table.query(
            KeyConditionExpression='fiscal_code = :fc AND begins_with(#timestamp, :ts)',
            ExpressionAttributeValues={
                ':fc': fiscal_code,
                ':ts': current_date
            },
            ExpressionAttributeNames={
                '#timestamp': 'timestamp'
            }
        )

        # Add each measurement to the array. Since the sorting key is the timestamp, the data are ordered.
        for item in response['Items']:
            measured_value = float(item['measured_value'])
            values.append(measured_value)

        mean_pH = round(statistics.mean(values), 2)

        print(values, mean_pH)

        item = {
            'fiscal_code': fiscal_code,
            'timestamp': current_date,
            'device_id': device_id,
            'average_value': str(mean_pH),
            'values': str(values)
        }
        averages_table.put_item(Item=item)
        print("Stored item", item)
