import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';

interface Category {
  _id: Types.ObjectId;
  title: string;
  color: string;
  userId: Types.ObjectId;
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clown',
    email: 'clown@gmail.com',
    password: '123456',
  };
  let token: string;
  let category: Category;

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
        email: 'updated@gmail.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/user')
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.username).toEqual(updatedData.username);
      expect(response.body.email).toEqual(updatedData.email);
    });

    datasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .patch('/user')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      }, 10000);
    });
  });

  describe('/category (POST)', () => {
    const dataset = [
      {
        message: 'empty title',
        data: {
          color: 'black',
        },
      },
      {
        message: 'too short title',
        data: {
          title: 'a',
          color: 'black',
        },
      },
      {
        message: 'too long title',
        data: {
          title: 'sportsportsportsportsport',
          color: 'black',
        },
      },
      {
        message: 'invalid type of title',
        data: {
          title: 123,
          color: 'black',
        },
      },
      {
        message: 'empty color',
        data: {
          title: 'sport',
        },
      },
      {
        message: 'too short color',
        data: {
          title: 'sport',
          color: 'a',
        },
      },
      {
        message: 'too long color',
        data: {
          title: 'sport',
          color: 'blackblackblackblackblack',
        },
      },
      {
        message: 'invalid type of color',
        data: {
          title: 'sport',
          color: false,
        },
      },
    ];

    it('should create a category and return it with 201 status code', async () => {
      const categoryData = {
        title: 'sport',
        color: 'gayblue',
      };

      const response = await request(app.getHttpServer())
        .post('/category')
        .send(categoryData)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toEqual(categoryData.title);
      expect(response.body.color).toEqual(categoryData.color);
      category = response.body;
    });

    dataset.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/category')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/category/:id (GET)', () => {
    it('should return category with the given id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/category/${category._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual(category);
    });

    it('should return an error with 400 status code when request url provided with invalid categoryId', async () => {
      const response = await request(app.getHttpServer())
        .get('/category/categoryId')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    it('should return an error with 404 status code when request url provided with non-existing categoryId', async () => {
      const response = await request(app.getHttpServer())
        .get('/category/652461519fd85ce71a666e77')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('/category (GET)', () => {
    it('should return 401 Bad Request if "page" is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .query({ page: 'invalid' });

      expect(response.status).toBe(401);
    });

    it('should return 401 Bad Request if "limit" is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .query({ limit: 'invalid' });

      expect(response.status).toBe(401);
    });

    it('should return 200 OK if all query parameters are valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .query({ title: 'valid', color: 'valid', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should return 200 OK if some query parameters are missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .query({ title: 'valid' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request if "color" is not a string', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .query({ color: 123 });

      expect(response.status).toBe(401);
    });
  });

  describe('/category/:id (PATCH)', () => {
    const dataset = [
      {
        message: 'too short title',
        data: {
          title: 'a',
          color: 'black',
        },
      },
      {
        message: 'too long title',
        data: {
          title: 'sportsportsportsportsport',
          color: 'black',
        },
      },
      {
        message: 'invalid type of title',
        data: {
          title: 123,
          color: 'black',
        },
      },
      {
        message: 'too short color',
        data: {
          title: 'sport',
          color: 'a',
        },
      },
      {
        message: 'too long color',
        data: {
          title: 'sport',
          color: 'blackblackblackblackblack',
        },
      },
      {
        message: 'invalid type of color',
        data: {
          title: 'sport',
          color: false,
        },
      },
    ];

    it('should update category data and return updated category', async () => {
      const updatedCategory = {
        title: 'games',
        color: 'purple',
      };

      const response = await request(app.getHttpServer())
        .patch(`/category/${category._id}`)
        .send(updatedCategory)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.title).toEqual(updatedCategory.title);
      expect(response.body.color).toEqual(updatedCategory.color);
    });

    dataset.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .patch('/category')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/category/:id (DELETE)', () => {
    it('should delete a category and return 204 status code', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/category/${category._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
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
});
