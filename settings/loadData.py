import boto3
import datetime
import random
import time
import statistics

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

measurements_table = dynamodb.Table('Measurements')
averages_table = dynamodb.Table('Averages')

# Device = (device_Id, fiscal_code)
devices = [('01', 'FRRLNZ50M24F839C'),
           ('02', 'BNCCHR89A41L219V'),
           ('03', 'FRNRSS71D70A662A'),
           ('04', 'RMNLRT80T03A783U'),
           ('05', 'BRBSMN63P26F205X')]

for device in devices:
    values = []
    for i in range(0, 7):
        # Compute yesterday
        measure_date = str((datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"))

        if random.random() > 0.10:
            # Generate regular pH value
            blood_pH = round(random.uniform(7.35, 7.45), 2)
            values.append(blood_pH)
        else:
            # Generate warning pH value
            blood_pH = round(random.uniform(4.0, 7.34), 2)
            values.append(blood_pH)

        item = {
            'fiscal_code': device[1],
            'timestamp': measure_date,
            'device_id': device[0],
            'measured_value': str(blood_pH)
        }

        measurements_table.put_item(Item=item)

        print("Stored item", item)

        # It is necessary to obtain the measurements at different times, otherwise the data will be overwritten.
        time.sleep(1)

    # Compute yesterday
    measure_date = str((datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"))

    mean_pH = round(statistics.mean(values), 2)

    item = {
        'fiscal_code': device[1],
        'timestamp': measure_date,
        'device_id': device[0],
        'average_value': str(mean_pH),
        'values': str(values)
    }
    averages_table.put_item(Item=item)

    print("Stored item", item)
