import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Category } from '../test/interfaces';

describe('Category controller (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clownCategory',
    email: 'clownCategory@circus.com',
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

    const response = await request(app.getHttpServer())
      .post('/user/signup')
      .send(userData);

    token = response.body.token;
    return token;
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
      for (const key in categoryData) {
        expect(response.body[key]).toEqual(categoryData[key]);
      }
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

      for (const key in updatedCategory) {
        expect(response.body[key]).toEqual(updatedCategory[key]);
      }
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

      const deletedCategory = await request(app.getHttpServer())
        .get(`/category/${category._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
      expect(deletedCategory.statusCode).toBe(404);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    await app.close();
  });
});
