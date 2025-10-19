// tests/setup.ts or at the top of each test file
import request from 'supertest';

export const api = request('http://localhost:5000');
