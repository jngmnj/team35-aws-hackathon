const https = require('https');

// 실제 사용자 토큰 (로그인해서 얻은 토큰)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOGZjNzIyYi05NDBiLTQzYzAtYTc0YS03ZTIzNjljNzJhMGMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3MjU1NTI2NzQsImV4cCI6MTcyNTYzOTA3NH0.Qs7Ej8Qs7Ej8Qs7Ej8Qs7Ej8Qs7Ej8Qs7Ej8Qs7Ej8'; // 실제 토큰으로 교체 필요

const postData = JSON.stringify({});

const options = {
  hostname: 'oxunoozv13.execute-api.us-east-1.amazonaws.com',
  port: 443,
  path: '/prod/analysis',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();