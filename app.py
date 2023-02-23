from boto3.dynamodb.conditions import Key, Attr
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS, cross_origin
import boto3

app = Flask(__name__)
CORS(app)
dynamodb = boto3.resource('dynamodb', endpoint_url='http://localhost:4566')


@app.route('/patients', methods=['GET'])
@cross_origin()
def get_all_patients():

    patients_table = dynamodb.Table('Patients')
    response = patients_table.scan()
    items = response['Items']

    res = make_response(jsonify(items), 200)
    return res

if __name__ == '__main__':
    app.run(debug=True)
