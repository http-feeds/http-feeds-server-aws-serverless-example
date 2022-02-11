const lambda = require('../../../src/handlers/append-item.js');
const dynamodb = require('aws-sdk/clients/dynamodb');
 
describe('Test appendItemHandler', function () {
    let putSpy; 
 
    beforeAll(() => {
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    }); 
 
    afterAll(() => {
        putSpy.mockRestore(); 
    }); 
 
    it('should add event table', async () => {
        const returnedItem = { id: 'id1', name: 'name1' }; 
 
        putSpy.mockReturnValue({
            promise: () => Promise.resolve(returnedItem) 
        }); 
 
        const event = { 
            httpMethod: 'POST', 
            body: '{"id": "id1","name": "name1"}' 
        }; 
     
        // Invoke putItemHandler() 
        const result = await lambda.appendItemHandler(event);
        const expectedResult = { 
            statusCode: 200, 
            body: JSON.stringify(returnedItem) 
        }; 
 
        // Compare the result with the expected result 
        expect(result).toEqual(expectedResult); 
    }); 
}); 
 