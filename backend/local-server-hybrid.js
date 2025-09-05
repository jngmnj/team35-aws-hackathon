const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// JWT 로직 직접 구현
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { 
    expiresIn: '24h',
    issuer: 'resume-generator'
  });
}

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return { success: true, payload };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 헬스체크 엔드포인트
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Resume Generator API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login'
      },
      documents: {
        list: 'GET /documents',
        create: 'POST /documents',
        update: 'PUT /documents/:id',
        delete: 'DELETE /documents/:id'
      }
    },
    database: {
      users: mockDB.users.size,
      documents: mockDB.documents.size
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 메모리 기반 DB (실제 로직은 유지)
const mockDB = {
  users: new Map(),
  documents: new Map()
};

// 실제 회원가입 로직 (DynamoDB 대신 메모리 사용)
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    if (mockDB.users.has(email)) {
      return res.status(400).json({ success: false, error: { message: 'User already exists' } });
    }

    // 실제 암호화 사용
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = {
      userId,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDB.users.set(email, user);

    // 실제 JWT 토큰 생성
    const token = generateToken({ userId, email });

    res.status(201).json({
      success: true,
      data: { userId, email, name, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// 실제 로그인 로직
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = mockDB.users.get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    // 실제 암호 검증
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    // 실제 JWT 토큰 생성
    const token = generateToken({ userId: user.userId, email: user.email });

    res.json({
      success: true,
      data: { userId: user.userId, email: user.email, name: user.name, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'Missing or invalid authorization header' } });
  }

  const token = authHeader.substring(7);
  const result = verifyToken(token);
  
  if (!result.success || !result.payload) {
    return res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }

  req.user = result.payload;
  next();
}

// 실제 문서 CRUD 로직
app.get('/documents', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const documents = Array.from(mockDB.documents.values()).filter(doc => doc.userId === userId);
    
    res.json({
      success: true,
      data: { documents, total: documents.length }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

app.post('/documents', authenticateToken, (req, res) => {
  try {
    const { type, title, content } = req.body;
    const userId = req.user.userId;

    if (!type || !title) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    const documentId = uuidv4();
    const now = new Date().toISOString();

    const document = {
      documentId,
      userId,
      type,
      title,
      content: content || '',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    mockDB.documents.set(documentId, document);

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

app.put('/documents/:id', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.userId;

    const document = mockDB.documents.get(documentId);
    if (!document) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    if (title) document.title = title;
    if (content !== undefined) document.content = content;
    document.updatedAt = new Date().toISOString();
    document.version += 1;

    mockDB.documents.set(documentId, document);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

app.delete('/documents/:id', authenticateToken, (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.userId;

    const document = mockDB.documents.get(documentId);
    if (!document) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    mockDB.documents.delete(documentId);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 하이브리드 로컬 서버 실행: http://localhost:${PORT}`);
  console.log('✅ 실제 Lambda 로직 + 메모리 DB');
  console.log('📋 API 엔드포인트:');
  console.log('  POST /auth/register - 실제 JWT + 암호화');
  console.log('  POST /auth/login - 실제 JWT + 암호화');
  console.log('  GET /documents - 실제 JWT 인증');
  console.log('  POST /documents - 실제 JWT 인증');
  console.log('  PUT /documents/:id - 실제 JWT 인증');
  console.log('  DELETE /documents/:id - 실제 JWT 인증');
});