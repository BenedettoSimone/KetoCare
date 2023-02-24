import logging
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")
s3_client = boto3.client('s3', endpoint_url="http://localhost:4566")

try:
    # create S3 bucket to store only images
    s3_client.create_bucket(Bucket="patientsimages", CreateBucketConfiguration={'LocationConstraint': 'us-east-2'})
except ClientError as e:
    logging.error(e)


# Load Data
patients_table = dynamodb.Table('Patients')

# fiscal_code, name, surname, birthdate, diabet type (1 or 2), image_file
patients = [('CGLSZV61B26A832H', 'Mario', 'Rossi', '07/02/2000', '1', '../images/patient_images/mario.jpg'),
           ('TGHCNE68P03C166P', 'Paola', 'Verdi', '03/12/1978', '2', '../images/patient_images/luca.jpg'),
           ('HQCQGX75E04D233U', 'Marco', 'Del Gaudio', '31/12/1989', '1', '../images/patient_images/marco.jpg'),
           ('DMCNJS43M44B320A', 'Eleonora', 'Capotondi', '05/03/1991', '2', '../images/patient_images/eleonora.jpg'),
           ('RMTPYV37C30C865B', 'Luca', 'Esposito', '19/06/2001', '1', '../images/patient_images/paola.jpg')]

for patient in patients:
    try:
        # upload the image in "patientsimages" bucket with another name (fiscal_code.jpg)
        result = s3_client.upload_file(patient[5], "patientsimages", patient[0] + ".jpg")
    except ClientError as e:
        logging.error(e)

    # Insert patient data into DynamoDB
    item = {
        'fiscal_code': patient[0],
        'name':  patient[1],
        'surname':  patient[2],
        'birthdate':  patient[3],
        'diabet_type':  patient[4],
        'image_file': patient[0]+".jpg"
    }
    patients_table.put_item(Item=item)

    print("Stored item", item)
