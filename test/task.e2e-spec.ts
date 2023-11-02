import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';

interface Category {}

interface Task {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categories: Category[];
  isCompleted: boolean;
  dateOfCompletion: null | Date;
  links: Array<string>;
  deadline: null | Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

describe('Task ontroller (e2e)', () => {
  let app: INestApplication;
  const userData = {
    username: 'clownTask',
    email: 'clownTask@circus.com',
    password: '123456',
  };
  let token: string;
  let task: Task;
  const taskDataset = [
    {
      message: 'empty title',
      data: {
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'too short title',
      data: {
        title: 'a',
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'too long title',
      data: {
        title: 'sportsportsportsportsportsportsportsportsportsport!',
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'invalid type of title',
      data: {
        title: 123,
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'empty description',
      data: {
        title: 'task',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'too short description',
      data: {
        title: 'task',
        description: 'a',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'invalid type of description',
      data: {
        title: 'task',
        description: 123,
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'invalid type of categories',
      data: {
        title: 'task',
        description: 'description',
        categories: 'niggers',
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'invalid type of isCompleted',
      data: {
        title: 'task',
        description: 'description',
        categories: [],
        isCompleted: 'yes',
        dateOfCompletion: null,
        links: [],
        deadline: null,
      },
    },
    {
      message: 'invalid type of links',
      data: {
        title: 'task',
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: 'https://www.instagram.com/ivan_anenko/',
        deadline: null,
      },
    },
    {
      message: 'invalid type of deadline',
      data: {
        title: 'task',
        description: 'description',
        categories: [],
        isCompleted: true,
        dateOfCompletion: null,
        links: [],
        deadline: 'yesterday',
      },
    },
  ];

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

  describe('/task (POST)', () => {
    it('should create a task and return it with 201 status code', async () => {
      const taskData = {
        title: 'task',
        description: 'description',
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
      };

      const response = await request(app.getHttpServer())
        .post('/task')
        .send(taskData)
        .set('Authorization', `Bearer ${token}`);

      for (const key in taskData) {
        expect(response.body[key]).toEqual(taskData[key]);
      }
      task = response.body;
    });

    taskDataset.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .post('/task')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/task/:id (GET)', () => {
    it('should return task with the given id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/task/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toEqual(task);
    });

    it('should return an error with 400 status code when request url provided with invalid taskId', async () => {
      const response = await request(app.getHttpServer())
        .get('/task/taskId')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    it('should return an error with 404 status code when request url provided with non-existing taskId', async () => {
      const response = await request(app.getHttpServer())
        .get('/task/652461519fd85ce71a666e77')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('/task (GET)', () => {
    it('should return 401 Bad Request if "page" is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get('/task')
        .query({ page: 'invalid' });

      expect(response.status).toBe(401);
    });

    it('should return 401 Bad Request if "limit" is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get('/task')
        .query({ limit: 'invalid' });

      expect(response.status).toBe(401);
    });

    it('should return 200 OK if all query parameters are valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/task')
        .query({ title: 'valid', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('/task/:id (PATCH)', () => {
    it('should update task data and return updated task', async () => {
      const updatedTask = {
        title: 'task',
        description: 'description',
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`/task/${task._id}`)
        .send(updatedTask)
        .set('Authorization', `Bearer ${token}`);

      for (const key in updatedTask) {
        expect(response.body[key]).toEqual(updatedTask[key]);
      }
      expect(response.body.links).toEqual(updatedTask.links);
    });

    taskDataset.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const response = await request(app.getHttpServer())
          .patch('/task')
          .send(dataset.data)
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('/task/stats (POST)', () => {
    it('should return stats', async () => {
      const response = await request(app.getHttpServer())
        .post('/task/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(201);
    });
  });

  describe('/task/:id (DELETE)', () => {
    it('should delete a task and return 204 status code', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/task/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    await app.close();
  });
});
