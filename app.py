import logging
from botocore.exceptions import ClientError
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS, cross_origin
import boto3

app = Flask(__name__)
CORS(app)
dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:4566')
s3_client = boto3.client('s3', endpoint_url="http://localhost:4566")


@app.route('/patients', methods=['GET'])
@cross_origin()
def get_all_patients():
    patients_table = dynamodb.Table('Patients')
    response = patients_table.scan()
    items = response['Items']

    # update items with URL for image file
    for item in items:
        try:
            # generate URL for image file
            url = s3_client.generate_presigned_url('get_object',
                                                   Params={'Bucket': 'patientsimages', 'Key': item['image_file']},
                                                   ExpiresIn=3600)
            item['image_url'] = url
        except ClientError as e:
            logging.error(e)

    print(items)

    res = make_response(jsonify(items), 200)
    return res


@app.route('/average', methods=['POST'])
@cross_origin()
def get_average():

    data = request.get_json()
    fiscal_code = data.get('fiscal_code')
    date = data.get('date')

    measurements_table = dynamodb.Table("Averages")

    response = measurements_table.query(
        KeyConditionExpression='fiscal_code = :fc AND begins_with(#timestamp, :ts)',
        ExpressionAttributeValues={
            ':fc': fiscal_code,
            ':ts': date
        },
        ExpressionAttributeNames={
            '#timestamp': 'timestamp'
        }
    )

    items = response['Items']
    print(items)
    res = make_response(jsonify(items), 200)
    return res


if __name__ == '__main__':
    app.run(debug=True)
