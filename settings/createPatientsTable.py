import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")


table = dynamodb.create_table(
        TableName='Patients',
        KeySchema=[
            {
                'AttributeName': 'fiscal_code',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'fiscal_code',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 10,
            'WriteCapacityUnits': 10
        }
    )

table.wait_until_exists()
print('Table', table, 'created.')
