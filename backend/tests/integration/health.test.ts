import request from 'supertest';
import { app } from '../../src/index';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /api/v1/search', () => {
  it('returns 400 when query is empty', async () => {
    const res = await request(app).get('/api/v1/search?q=');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when q param is missing', async () => {
    const res = await request(app).get('/api/v1/search');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/medications/autocomplete', () => {
  it('returns 200 with data array', async () => {
    const res = await request(app).get('/api/v1/medications/autocomplete?q=doli');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns empty array for short query', async () => {
    const res = await request(app).get('/api/v1/medications/autocomplete?q=a');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
