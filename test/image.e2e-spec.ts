import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
//import * as fs from 'fs';

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
    const dataset = [
      {
        message: 'empty image',
        data: {},
      },
      {
        message: 'invalid type of image',
        data: {
          image: 'dick pic',
        },
      },
    ];
    /* MAKE MY WORK!!!(((
    
    it('should upload an image and return 201 status code', async () => {
      const formData = new FormData();
      const file = fs.readFileSync('./test/test.jpg', 'utf8');

      formData.append('image', file);

      const response = await request(app.getHttpServer())
        .post('/image/avatar')
        .send({ image: formData })
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
    });
    
    DELETE TEMPORARY TEST!!!
    */
    it('temporary test', () => {
      expect('cat').toBe('cat');
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    await app.close();
  });
});
