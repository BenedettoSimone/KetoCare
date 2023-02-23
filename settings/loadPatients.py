import boto3

dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:4566")

# Load Data
patients_table = dynamodb.Table('Patients')

# fiscal_code, name, surname, birthdate, diabet type (1 or 2)
patients = [('CGLSZV61B26A832H', 'Mario', 'Rossi', '07/02/2000', '1'),
           ('TGHCNE68P03C166P', 'Paola', 'Verdi', '03/12/1978', '2'),
           ('HQCQGX75E04D233U', 'Marco', 'Del Gaudio', '31/12/1989', '1'),
           ('DMCNJS43M44B320A', 'Eleonora', 'Capotondi', '05/03/1991', '2'),
           ('RMTPYV37C30C865B', 'Luca', 'Esposito', '19/06/2001', '1')]

for patient in patients:

    item = {
        'fiscal_code': patient[0],
        'name':  patient[1],
        'surname':  patient[2],
        'birthdate':  patient[3],
        'diabet_type':  patient[4]
    }
    patients_table.put_item(Item=item)

    print("Stored item", item)