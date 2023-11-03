import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as path from 'path';

describe('Image controller (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clownImage',
    email: 'clownImahe@circus.com',
    password: '123456',
  };
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/user/signup')
      .send(userData);

    token = response.body.token;
    return token;
  });

  describe('/image/avatar (POST)', () => {
    it('should upload an image and return 201 status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/image/avatar')
        .attach('image', path.join(__dirname, 'test.jpg'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
    });

    it('should return an error if request is provided with invalid file', async () => {
      const response = await request(app.getHttpServer())
        .post('/image/avatar')
        .attach('image', path.join(__dirname, 'pis.pdf'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    await app.close();
  });
});
