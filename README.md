# KetoCare Monitor

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

### Setting up the environment
**1. Clone the repository**

```
git clone https://github.com/BenedettoSimone/KetoCare-Motion.git
```

**2. Launch [LocalStack](https://localstack.cloud/)**

```
docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
```

**3. Create a SQS queue for measurements and for advertisement**

```
aws sqs create-queue --queue-name Measurements --endpoint-url=http://localhost:4566
```

```
aws sqs create-queue --queue-name Advertisement --endpoint-url=http://localhost:4566
```


To check that the queues have been correctly created use the following command.
	
```
aws sqs list-queues --endpoint-url=http://localhost:4566
```