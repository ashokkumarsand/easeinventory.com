import { test, expect } from '../fixtures/test.fixture';

test.describe('Health API', () => {
  test('GET /api/health returns 200', async ({ apiHelper }) => {
    const { status, body } = await apiHelper.healthCheck();
    expect(status).toBe(200);
    expect(body.status).toBe('healthy');
  });

  test('health check reports database connected', async ({ apiHelper }) => {
    const { body } = await apiHelper.healthCheck();
    expect(body.database).toBe('connected');
  });

  test('health check includes version', async ({ apiHelper }) => {
    const { body } = await apiHelper.healthCheck();
    expect(body.version).toBeDefined();
  });
});
