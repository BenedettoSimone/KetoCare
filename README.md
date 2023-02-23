# KetoCare

<p align="center"><img src="./images/cover.png"/></p>

This project aims to provide support to doctors to monitor diabetes and prevent diabetic ketoacidosis.

Diabetes is a chronic disease that requires continuous and accurate monitoring of blood sugar levels. A potentially dangerous complication of diabetes, called ketoacidosis, occurs when the organism begins to produce excess ketones leading to an increase of the acidity level in the blood.

The project is based on an IoT Cloud architecture where each sensor (placed on each patient) collects information about blood pH and sends it to the Cloud where it will be processed through Serverless Computing and stored in a NoSQL database.

The sensors' functionality is inspired by the method described in the paper [Bioresorbable Nanostructured Chemical Sensor for Monitoring of pH Level In Vivo](https://onlinelibrary.wiley.com/doi/pdf/10.1002/advs.202202062). The sensor takes pH measurements from `4.0 to 7.45`.

Each sensor sends a message containing the following information:

- sensor ID;
- time in format yyyy-mm-dd hh:mm:ss;
- fiscal code of the patient;
- blood pH value.

The messages are sent on two queues according to the pH value. On the "Measurements" queue all measurements taken are sent, while on the "Warning" queue are sent messages (without specifying the sensor ID) for pH values less than 7.35. Each message sent on the "Warning" queue triggers a Serverless function that sends an email to the doctor notifying him of the warning.
<p align="center"><img src="./images/email.png"/></p>

Since 7 measurements per day will be taken, at the end of the day a time triggered Serverless function compute the average of the values measured during the day using the messages stored on the "Measurements" queue. The function filter the messages on the queue by device id and by date of measurement, take the average and save the result to a NoSQL database. 
The database contains the history of all computed average values and each item stored in the database contains the following information:
- fiscal code of the patient;
- time in format yyyy-mm-dd hh:mm:ss;
- blood pH average;
- sensor ID;
- blood pH values.
<p align="center"><img src="./images/db_structure.png"/></p>

## Architecture
<p align="center"><img src="./images/architecture.jpg"/></p>

- The Cloud environment is simulated using [LocalStack](https://localstack.cloud/) to replicate the [AWS services](https://aws.amazon.com/).
- The IoT devices are simulated using a Python function exploiting [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html) to send messages on the queues.
- The queue are implemented using [Amazon Simple Queue Service (SQS)](https://aws.amazon.com/sqs/).
- The database is built using [Amazon DynamoDB](https://aws.amazon.com/dynamodb/).
- The functions are Serveless functions deployed on [AWS Lambda](https://aws.amazon.com/lambda/).
- The time-triggered function is implemented using [Amazon EventBridge](https://aws.amazon.com/eventbridge/).
- The email is sent using [IFTT](https://ifttt.com/).
- The DynamoDB GUI is available using [dynamodb-admin](https://github.com/aaronshaf/dynamodb-admin).



## Prerequisites
1. [Docker](https://docs.docker.com/get-docker/);
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html);
3. [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html).
4. (Optional) nodejs for database visualization.


## Setting up the environment
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
	
1) Use the python code to create the DynamoDB tables
	
```shell
cd KetoCare
```
```
python3 settings/createMeasurementsTable.py
```
```
python3 settings/createAveragesTable.py
```

2) Check that the tables have been correctly created

```
aws dynamodb list-tables --endpoint-url=http://localhost:4566
```
	
3) Populate the tables with some data. In particular, will be loaded the measurements and the average of the previous day's measurements of the current day
	
```
python3 settings/loadData.py
```
	
4) Check that the table are been correctly populated using the AWS CLI (*Press q to exit*)

```
aws dynamodb scan --table-name Measurements --endpoint-url=http://localhost:4566
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
- *Subject*: `[KetoCare] Warning!`
		
- *Body*: `The sensor of patient <b>{{Value1}}</b> reported at <b>{{Value2}}</b> a blood pH value of <b>{{Value3}}</b> .`
	
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

