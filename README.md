# KetoCare

<p align="center"><img src="./images/cover.png"/></p>

This project aims to provide support to doctors to monitor diabetes and prevent diabetic ketoacidosis.

Diabetes is a chronic disease that requires continuous and accurate monitoring of blood sugar levels. A potentially dangerous complication of diabetes, called ketoacidosis, occurs when the organism begins to produce excess ketones leading to an increase of the acidity level in the blood.


## Architecture

- The Cloud environment is simulated using [LocalStack](https://localstack.cloud/) to replicate the [AWS services](https://aws.amazon.com/).
- The IoT devices are simulated using a Python function exploiting [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html) to send messages on the queues.
- The queue are implemented using [Amazon Simple Queue Service (SQS)](https://aws.amazon.com/sqs/).
- The database is built using [Amazon DynamoDB](https://aws.amazon.com/dynamodb/).
- The functions are Serveless functions deployed on [AWS Lambda](https://aws.amazon.com/lambda/).
- The time-triggered function is implemented using [Amazon EventBridge](https://aws.amazon.com/eventbridge/).
- The email is sent using [IFTT](https://ifttt.com/).
- The DynamoDB GUI is available using [dynamodb-admin](https://github.com/aaronshaf/dynamodb-admin).


## Installation and usage
### Prerequisites
1. [Docker](https://docs.docker.com/get-docker/);
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html);
3. [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html).
4. nodejs
### Setting up the environment
**1. Clone the repository**

```
git clone https://github.com/BenedettoSimone/KetoCare-Motion.git
```

**2. Launch [LocalStack](https://localstack.cloud/)**

```
docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
```

**3. Create a SQS queue for measurements and for warnings**

```
aws sqs create-queue --queue-name Measurements --endpoint-url=http://localhost:4566
```

```
aws sqs create-queue --queue-name Warning --endpoint-url=http://localhost:4566
```


To check that the queues have been correctly created use the following command.
	
```
aws sqs list-queues --endpoint-url=http://localhost:4566
```

**4. Create the DynamoDB table and populate it**
	
1) Use the python code to create the DynamoDB table
	
```shell
cd KetoCare
```
```
python3 settings/createTable.py
```

2) Check that the tables are been correctly created

```
aws dynamodb list-tables --endpoint-url=http://localhost:4566
```
	
3) Populate the tables with some data
	
```
python3 settings/loadData.py
```
	
4) Check that the table are been correctly populated using the AWS CLI (*Press q to exit*)

```
aws dynamodb scan --table-name Hospital --endpoint-url=http://localhost:4566
```
	
or using the [dynamodb-admin] GUI with the command
	
```
DYNAMO_ENDPOINT=http://0.0.0.0:4566 dynamodb-admin
```
	
and then going to `http://localhost:8001`.

**5. Set up the Lambda function triggered by SQS messages that notifies errors in IoT devices via email**

1) Create the IFTT Applet
	1. Go to https://ifttt.com/ and sign-up or log-in if you already have an account.
	2. On the main page, click *Create* to create a new applet.
	3. Click "*If This*", type *"webhooks"* in the search bar, and choose the *Webhooks* service.
	4. Select "*Receive a web request*" and write *"email_warning"* in the "*Event Name*" field. Save the event name since it is required to trigger the event. Click *Create trigger*.
	5. In the applet page click *Then That*, type *"email"* in the search bar, and select *Email*.
	6. Click *Send me an email* and fill the fields as follow:
- *Subject*: `[WeatherStation] Attention a device encountered an error!`
		
- *Body*: `A device of WeatherStation generated an error.<br> Device {{Value1}} got an error at {{Value2}} <br> Sent by WeatherStation.`
	
	7. Click *Create action*, *Continue*, and *Finish*.

2) Modify the variable `key` within the `emailWarning.py` function with your IFTT applet key. The key can be find clicking on the icon of the webhook and clicking on *Documentation*.

3) Zip the Python file and create the Lambda function
```
aws iam create-role --role-name lambdarole --assume-role-policy-document file://settings/role_policy.json --query 'Role.Arn' --endpoint-url=http://localhost:4566
```
```
aws iam put-role-policy --role-name lambdarole --policy-name lambdapolicy --policy-document file://settings/policy.json --endpoint-url=http://localhost:4566
```
```
zip emailWarning.zip settings/emailWarning.py
```

```
aws lambda create-function --function-name emailWarning --zip-file fileb://emailWarning.zip --handler settings/emailWarning.lambda_handler --runtime python3.6 --role arn:aws:iam::000000000000:role/lambdarole --endpoint-url=http://localhost:4566
```

4) Create the event source mapping between the function and the queue

```
aws lambda create-event-source-mapping --function-name emailWarning --batch-size 5 --maximum-batching-window-in-seconds 60 --event-source-arn arn:aws:sqs:us-east-2:000000000000:Warning --endpoint-url=http://localhost:4566
```

5) Test the mapping sending a message on the error queue and check that an email is sent

```
aws sqs send-message --queue-url http://localhost:4566/000000000000/Warning --message-body '{"fiscal_code": "SMNDBT00B07I197T","measure_date": "2011-223-232", "measured_value": "7.5 (Medium)"}' --endpoint-url=http://localhost:4566
```