const tableName = process.env.FEED_TABLE;

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * Returns a batch of feed items, greater than the lastEventId parameter (if specified, otherwise from the beginning)
 */
exports.getFeedItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getFeedItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    console.info('request:', event);

    const lastEventId = extractLastEventId(event)

    console.info('lastEventId:', lastEventId);

    // Query results are always sorted by the sort key value (this is the event Id).
    const params = {
        TableName: tableName,
        ScanFilter: {
            'id': {
                ComparisonOperator: "GT",
                AttributeValueList: [
                    lastEventId
                ]
            }
        },
        Limit: 1000
    };
    const data = await docClient.scan(params).promise();

    console.info('received data:', data);

    const items = data.Items;
    const events = items.map(i => { i.data = JSON.parse(i.data); return i; });

    const response = {
        statusCode: 200,
        body: JSON.stringify(events)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}

function extractLastEventId(event) {
    if (!event.queryStringParameters?.lastEventId) {
        return ""
    }

    return event.queryStringParameters.lastEventId;
}
