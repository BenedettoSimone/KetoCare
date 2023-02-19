import boto3
import datetime
import random

sqs = boto3.resource('sqs', endpoint_url='http://localhost:4566')

# Device = (device_Id, fiscal_code)
devices = [('01', 'CGLSZV61B26A832H'),
           ('02', 'TGHCNE68P03C166P'),
           ('03', 'HQCQGX75E04D233U'),
           ('04', 'DMCNJS43M44B320A'),
           ('05', 'RMTPYV37C30C865B')]

for device in devices:

    queue = sqs.get_queue_by_name(QueueName="Measurements")
    measure_date = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # Measure blood pH
    # Regular: 7.35 <= x <= 7.45
    # Slight: 7.20 <= x <= 7.30
    # Moderate: 7.10 <= x <= 7.20
    # Severe: < 7.1

    # The sensor measure the value from 4.0 to 7.45

    if random.random() > 0.10:
        # Generate regular pH value
        blood_pH = round(random.uniform(7.35, 7.45), 2)
        msg_body = '{"device_id": "%s","measure_date": "%s","fiscal_code": "%s","measured_value": "%s"}' \
                   % (device[0], measure_date, device[1], str(blood_pH))
        print(msg_body)
        queue.send_message(MessageBody=msg_body)
    else:
        # Generate warning pH value
        blood_pH = round(random.uniform(4.0, 7.34), 2)
        warning_queue = sqs.get_queue_by_name(QueueName="Warning")
        warning_msg = '{"fiscal_code": "%s","measure_date": "%s", "measured_value": "%s"}' % (device[1], measure_date, str(blood_pH))
        print(warning_msg)
        warning_queue.send_message(MessageBody=warning_msg)
