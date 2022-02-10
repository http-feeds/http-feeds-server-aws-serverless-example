// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.FEED_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * Returns a batch of feed items, greater than the lastEventId parameter (if specified, otherwise from the beginning)
 */
exports.getFeedItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    const lastEventId = event?.queryStringParameters?.lastEventId || "" 

    console.info('received:', event);

    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
    var params = {
        TableName : tableName,
        ScanFilter: {
            'id': {
              ComparisonOperator: "GT",
              AttributeValueList: [
                lastEventId
              ]
            }
          }
    };
    const data = await docClient.scan(params).promise();

    console.info('received data:', data);

    const items = data.Items;

    const response = {
        statusCode: 200,
        body: JSON.stringify(items.map(i => {i.data = JSON.parse(i.data); return i;}))
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
