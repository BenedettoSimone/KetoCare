import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

# with a composite primary key consisting of a partition key attribute "fiscal_code" and a sorting key attribute "timestamp". Here's a breakdown of the parameters used in the
table = dynamodb.create_table(
    TableName="Averages",
    KeySchema=[
        {
            'AttributeName': 'fiscal_code',
            'KeyType': 'HASH'  # partition key
        },
        {
            'AttributeName': 'timestamp',
            'KeyType': 'RANGE'  # sorting key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'fiscal_code',
            'AttributeType': 'S'  # String
        },
        {
            'AttributeName': 'timestamp',
            'AttributeType': 'S'  # String
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 10,
        'WriteCapacityUnits': 10
    }
)

table.wait_until_exists()

print('Table', table, 'created!')