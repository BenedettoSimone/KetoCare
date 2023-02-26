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

# fiscal_code, first name, surname, birthdate, diabet type (1 or 2), image_file
patients = [('FRRLNZ50M24F839C', 'Lorenzo', 'Ferrari', '24/08/1950', '1', '../images/patient_images/lorenzo.jpg'),
                ('BNCCHR89A41L219V', 'Chiara', 'Bianchi', '01/01/1989', '2', '../images/patient_images/chiara.jpg'),
                ('FRNRSS71D70A662A', 'Francesca', 'Russo', '30/04/1971', '1', '../images/patient_images/francesca.jpg'),
                ('RMNLRT80T03A783U', 'Alberto', 'Romano', '03/12/1980', '2', '../images/patient_images/alberto.jpg'),
                ('BRBSMN63P26F205X', 'Simone', 'Barbieri', '26/09/1963', '1', '../images/patient_images/simone.jpg')]


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
