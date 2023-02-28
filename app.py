import logging
import os

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
        if 'image_file' in item:
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


@app.route('/measurements', methods=['POST'])
@cross_origin()
def get_measurements():

    data = request.get_json()
    fiscal_code = data.get('fiscal_code')
    date = data.get('date')

    measurements_table = dynamodb.Table("Measurements")

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


@app.route('/savePatient', methods=['POST'])
@cross_origin()
def save_patient():
    image = request.files.get('image')

    name = request.form['name']
    surname = request.form['surname']
    cf = request.form['cf']
    date = request.form['date']
    diabet_type = request.form['diabetType']

    print(image)
    if image is not None:
        # Save the image file to a temporary directory
        tmp_dir = 'tmp/'
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)
        tmp_filename = os.path.join(tmp_dir, f"{cf}.jpg")
        image.save(tmp_filename)


        try:
            # upload the image in "patientsimages" bucket with another name (fiscal_code.jpg)
            result = s3_client.upload_file(tmp_filename, "patientsimages", cf + ".jpg")
        except ClientError as e:
            logging.error(e)

        # Remove the temporary file from the server
        os.remove(tmp_filename)

    patients_table = dynamodb.Table('Patients')

    # Insert patient data into DynamoDB
    if image is not None:
        item = {
            'fiscal_code': cf,
            'name': name,
            'surname': surname,
            'birthdate': date,
            'diabet_type': diabet_type,
            'image_file': cf + ".jpg"
        }
    else:
        item = {
            'fiscal_code': cf,
            'name': name,
            'surname': surname,
            'birthdate': date,
            'diabet_type': diabet_type
        }

    response = patients_table.put_item(Item=item)

    print("Stored item", item)

    res = make_response(jsonify(response), 200)
    return res

if __name__ == '__main__':
    app.run(debug=True)
