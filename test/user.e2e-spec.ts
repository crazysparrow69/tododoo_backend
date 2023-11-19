import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('User controller (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clownUser',
    email: 'clownUser@circus.com',
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
  });

  describe('/user/signup (POST)', () => {
    const datasets = [
      {
        message: 'empty username',
        data: {
          email: 'test@gmail.com',
          password: '123456',
        },
      },
      {
        message: 'too short username',
        data: {
          username: 'а',
          email: 'sh@gmail.com',
          password: '123456',
        },
      },
      {
        message: 'too long username',
        data: {
          username: 'clownclownclownclownclown',
          email: 'sh@gmail.com',
          password: '123456',
        },
      },
      {
        message: 'invalid type of username',
        data: {
          username: true,
          email: 'test@gmail.com',
          password: '123456',
        },
      },
      {
        message: 'empty email',
        data: {
          username: 'test',
          password: '123456',
        },
      },
      {
        message: 'invalid email',
        data: {
          username: 'test',
          email: 'clown.com',
          password: '123456',
        },
      },
      {
        message: 'invalid type of email',
        data: {
          username: 'test',
          email: true,
          password: '123456',
        },
      },
      {
        message: 'empty password',
        data: {
          username: 'test',
          email: 'test@gmail.com',
        },
      },
      {
        message: 'too short password',
        data: {
          username: 'test',
          email: 'test@gmail.com',
          password: '12345',
        },
      },
      {
        message: 'too long password',
        data: {
          username: 'test',
          email: 'test@gmail.com',
          password: '123456789012345678901',
        },
      },
      {
        message: 'invalid type of password',
        data: {
          username: 'test',
          email: 'test@gmail.com',
          password: null,
        },
      },
    ];

    it('should register new user and return token with 201 status code', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      token = response.body.token;
    });

    datasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/user/signup')
          .send(dataset.data);

        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/user/me (GET)', () => {
    it("should return authorized user's data", async () => {
      const response = await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.email).toEqual(userData.email);
    });
  });

  describe('/user/signin (POST)', () => {
    const datasets = [
      {
        message: 'empty email',
        data: {
          password: '123456',
        },
      },
      {
        message: 'non-existant email',
        data: {
          email: 'bigdaddy@gmail.com',
          password: '123456',
        },
      },
      {
        message: 'invalid password',
        data: {
          email: 'clown@gmail.com',
          password: '123457',
        },
      },
    ];

    it('should authenticate and authorizate the user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/signin')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    datasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/user/signin')
          .send(dataset.data);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/user (PATCH)', () => {
    const datasets = [
      {
        message: 'too short username',
        data: {
          username: 'a',
        },
      },
      {
        message: 'too long username',
        data: {
          username: 'aaaaaaaaaaaaaaaaaaaaahuy',
        },
      },
      {
        message: 'invalid type of username',
        data: {
          username: 123456,
        },
      },
    ];

    it('should update user data and return updated user', async () => {
      const updatedData = {
        username: 'updated',
        email: 'updated@circus.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/user')
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`);

      for (const key in updatedData) {
        expect(response.body[key]).toEqual(updatedData[key]);
      }
    });

    datasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .patch('/user')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/user/password (POST)', () => {
    const datasets = [
      {
        message: 'empty old password',
        data: {
          newPassword: '1234567',
        },
      },
      {
        message: 'empty new password',
        data: {
          oldPassword: '123456',
        },
      },
      {
        message: 'too short old password',
        data: {
          oldPassword: '12345',
          newPassword: '1234567',
        },
      },
      {
        message: 'too long old password',
        data: {
          oldPassword: '123456789012345678901',
          newPassword: '1234567',
        },
      },
      {
        message: 'invalid type of old password',
        data: {
          oldPassword: null,
          newPassword: '1234567',
        },
      },
      {
        message: 'too short new password',
        data: {
          oldPassword: '123456',
          newPassword: '12345',
        },
      },
      {
        message: 'too long new password',
        data: {
          oldPassword: '123456',
          newPassword: '123456789012345678901',
        },
      },
      {
        message: 'invalid type of new password',
        data: {
          oldPassword: '123456',
          newPassword: null,
        },
      },
    ];

    it('should update user password and return updated user', async () => {
      const pastData = {
        oldPassword: userData.password,
        newPassword: '1234567',
      };

      const response = await request(app.getHttpServer())
        .post('/user/password')
        .send(pastData)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
    });

    datasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .patch('/user/password')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/user (DELETE)', () => {
    it('should delete user with 204 status code', async () => {
      const response = await request(app.getHttpServer())
        .delete('/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
