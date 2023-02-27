import boto3
import datetime
import statistics

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
measurements_table = dynamodb.Table('Measurements')
averages_table = dynamodb.Table('Averages')
patients_table = dynamodb.Table('Patients')


def lambda_handler(event, context):
    response = patients_table.scan()
    patients = response['Items']

    for patient in patients:
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")

        values = []
        response = measurements_table.query(
            KeyConditionExpression='fiscal_code = :fc AND begins_with(#timestamp, :ts)',
            ExpressionAttributeValues={
                ':fc': patient['fiscal_code'],
                ':ts': current_date
            },
            ExpressionAttributeNames={
                '#timestamp': 'timestamp'
            }
        )

        # Compute average only if there are 7 measurements
        if len(response['Items']) == 7:
            # Add each measurement to the array. Since the sorting key is the timestamp, the data are ordered.
            for item in response['Items']:
                measured_value = float(item['measured_value'])
                values.append(measured_value)

            mean_pH = round(statistics.mean(values), 2)

            print(values, mean_pH)

            item = {
                'fiscal_code': patient['fiscal_code'],
                'timestamp': current_date,
                'device_id': response['Items'][0]['device_id'],
                'average_value': str(mean_pH),
                'values': str(values)
            }
            averages_table.put_item(Item=item)
            print("Stored item", item)
