const uuid = require('uuid-with-v6');
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const tableName = process.env.FEED_TABLE;
const shouldCompact = process.env.SHOULD_COMPACT;

exports.appendItemHandler = async (event) => {
    console.info('received:', event);

    const body = JSON.parse(event.body)

    // generate a time-ordered uuid
    const id = uuid.v6();

    const params = {
        TableName: tableName,
        Item: {
            id: id,
            source: body.source,
            time: new Date().toISOString(),
            subject: body.subject,
            type: body.type,
            data: JSON.stringify(body.data)
        }
    };

    console.info(`persisting ${JSON.stringify(params)}`);
    await docClient.put(params).promise();

    if (shouldCompact && body.subject) {
        await compact(id, body.subject);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}

async function compact(id, subject) {
    const params = {
        TableName: tableName,
        ScanFilter: {
            'subject': {
                ComparisonOperator: "EQ",
                AttributeValueList: [
                    subject
                ]
            },
            'id': {
                ComparisonOperator: "LT",
                AttributeValueList: [
                    id
                ]
            }
        }
    };
    const itemsToDelete = await docClient.scan(params).promise();

    for (const item of itemsToDelete.Items) {
        console.info(`deleting item ${item.id}`);
        const deleteParams = {
            TableName: tableName,
            Key: {
                id: item.id,
                source: item.source
            }
        };
        await docClient.delete(deleteParams).promise();
    }
}
