const request = require('supertest');
const app     = require('../src/app');

let token;

beforeAll(async () => {
  // register & obtain token
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'carol', password: 'pass123' });
  token = res.body.token;
});

describe('Notes CRUD Endpoints', () => {
  let noteId;

  it('should create a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Note', content: 'Hello' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    noteId = res.body.id;
  });

  it('should fetch all notes for user', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(noteId);
  });

  it('should update the note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Updated!');
  });

  it('should delete the note', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});
