import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clown',
    email: 'clown@gmail.com',
    password: '123456',
  };
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
        message: 'empty username',
        data: {
          username: 'а',
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
    // const datasets = [
    //   {
    //     message: 'too short username',
    //     data: {
    //       username: 'a',
    //     },
    //   },
    //   {
    //     message: 'too long username',
    //     data: {
    //       username: 'aaaaaaaaaaaaaaaaaaaaahuy',
    //     },
    //   },
    //   {
    //     message: 'invalid type of username',
    //     data: {
    //       username: 123456,
    //     },
    //   },
    // ];

    it('should update user data and return updated user', async () => {
      const updatedData = {
        username: 'updated',
        email: 'updated@gmail.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/user')
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.username).toEqual(updatedData.username);
      expect(response.body.email).toEqual(updatedData.email);
    });

    // datasets.forEach((dataset) => {
    //   it(`should return an error if request is provided with ${dataset.message}`, async () => {
    //     const response = await request(app.getHttpServer())
    //       .patch('/user')
    //       .send(dataset.data)
    //       .set('Authorization', `Bearer ${token}`);

    //     expect(response.statusCode).toBeGreaterThanOrEqual(400);
    //   }, 10000);
    // });
  });

  describe('/user (DELETE)', () => {
    it('should delete user with 204 status code', async () => {
      const response = await request(app.getHttpServer())
        .delete('/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
    });
  });
});
