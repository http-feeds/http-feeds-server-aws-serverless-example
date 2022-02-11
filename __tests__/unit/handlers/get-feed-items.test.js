const lambda = require('../../../src/handlers/get-feed-items.js'); 
const dynamodb = require('aws-sdk/clients/dynamodb'); 
 
describe('Test getFeedItemsHandler', () => { 
    let scanSpy; 
 
   beforeAll(() => { 
        scanSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan'); 
    }); 
 
    afterAll(() => { 
        scanSpy.mockRestore(); 
    }); 
 
    it('should return items from the beginning', async () => { 
        const items = [
            {
                "type" : "org.http-feeds.example.inventory",
                "source" : "https://example.http-feeds.org/inventory",
                "id" : "1c6b8c6e-d8d0-4a91-b51c-1f56bd04c001",
                "time" : "2021-01-01T00:00:01Z",
                "subject" : "213123123",
                "data" : "{\"sku\":\"213123123\",\"updated\":\"2022-01-01T00:00:01Z\",\"quantity\":5}"
            },
            {
                "type" : "org.http-feeds.example.inventory",
                "source" : "https://example.http-feeds.org/inventory",
                "id" : "1c6b8c6e-d8d0-4a91-b51c-1f56bd04c002",
                "time" : "2021-01-01T00:00:02Z",
                "subject" : "213123123",
                "data" : "{\"sku\":\"213123123\",\"updated\":\"2022-01-01T00:00:01Z\",\"quantity\":5}"
            }
        ]; 
 
        scanSpy.mockReturnValue({ 
            promise: () => Promise.resolve({ Items: items }) 
        }); 
 
        const event = { 
            httpMethod: 'GET' 
        } 
 
        const result = await lambda.getFeedItemsHandler(event); 
 
        const expectedEvents = [{
            "type": "org.http-feeds.example.inventory",
            "source": "https://example.http-feeds.org/inventory",
            "id": "1c6b8c6e-d8d0-4a91-b51c-1f56bd04c001",
            "time": "2021-01-01T00:00:01Z",
            "subject": "213123123",
            "data": { "sku": "213123123", "updated": "2022-01-01T00:00:01Z", "quantity": 5 }
        }, {
            "type": "org.http-feeds.example.inventory",
            "source": "https://example.http-feeds.org/inventory",
            "id": "1c6b8c6e-d8d0-4a91-b51c-1f56bd04c002",
            "time": "2021-01-01T00:00:02Z",
            "subject": "213123123",
            "data": { "sku": "213123123", "updated": "2022-01-01T00:00:01Z", "quantity": 5 }
        }];
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(expectedEvents) 
        }; 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
