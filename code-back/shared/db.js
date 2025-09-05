const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const TABLES = {
  USERS: process.env.USERS_TABLE || 'Users',
  DOCUMENTS: process.env.DOCUMENTS_TABLE || 'Documents',
  ANALYSIS: process.env.ANALYSIS_TABLE || 'Analysis',
  RESUMES: process.env.RESUMES_TABLE || 'Resumes'
};

const dbOperations = {
  async create(tableName, item) {
    const params = {
      TableName: tableName,
      Item: {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    return await dynamodb.put(params).promise();
  },

  async get(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };
    const result = await dynamodb.get(params).promise();
    return result.Item;
  },

  async update(tableName, key, updateData) {
    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: 'SET updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    Object.keys(updateData).forEach((field, index) => {
      params.UpdateExpression += `, ${field} = :val${index}`;
      params.ExpressionAttributeValues[`:val${index}`] = updateData[field];
    });

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  },

  async delete(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };
    return await dynamodb.delete(params).promise();
  },

  async query(tableName, keyCondition, indexName = null) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyCondition.expression,
      ExpressionAttributeValues: keyCondition.values
    };

    if (indexName) {
      params.IndexName = indexName;
    }

    const result = await dynamodb.query(params).promise();
    return result.Items;
  }
};

module.exports = {
  dynamodb,
  TABLES,
  dbOperations
};