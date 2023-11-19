import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Task } from '../test/interfaces';

describe('Task controller (e2e)', () => {
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

  const WRONG_QUERY_DATA = [
    {
      page: 'ddfgd',
      limit: 10,
    },
    {
      page: undefined,
      limit: 10,
    },
    {
      page: 1,
      limit: 'dfgdfg',
    },
    {
      page: 1,
      limit: undefined,
    },
    {
      page: 1,
      limit: 10,
      deadline: 'kdlbcbnb',
      isCompleted: 'true',
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

    WRONG_QUERY_DATA.forEach((dataset, i) => {
      it(`should return 401 Bad Request if request is provided with wrong query params #${i}`, async () => {
        const response = await request(app.getHttpServer())
          .get('/task')
          .query(dataset);

        expect(response.status).toBe(401);
      });
    });

    it('should return 200 OK if all query parameters are valid', async () => {
      const response = await request(app.getHttpServer())
        .get('/task')
        .query({ title: 'valid', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should return return all data correctly', async () => {
      const createdCategory = await request(app.getHttpServer())
        .post('/category')
        .send({
          title: 'simpleTasks',
          color: 'green',
        })
        .set('Authorization', `Bearer ${token}`);

      const createdCategoryId = createdCategory.body._id;

      const CREATED_TASKS_IDS = [];

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const DATASET_FOR_TASKS_CREATING = [
        {
          title: 'task1',
          description: 'description1',
          categories: [createdCategoryId],
          isCompleted: false,
          dateOfCompletion: null,
          links: [],
          deadline: tomorrow,
        },
        {
          title: 'task2',
          description: 'description2',
          categories: [],
          isCompleted: false,
          dateOfCompletion: null,
          links: [
            'https://github.com/crazysparrow69/tododoo_backend/wiki/Task#post-task',
          ],
        },
        {
          title: 'task3',
          description: 'description3',
          categories: [createdCategoryId],
          isCompleted: true,
          dateOfCompletion: Date.now(),
          links: [],
        },
      ];

      const DATASET_FOR_FILTERS_CHECKING = [
        {
          inputParams: {
            isCompleted: false,
            deadline: 'week',
          },
          objectIndex: 0,
        },
        {
          inputParams: {
            isCompleted: true,
          },
          objectIndex: 2,
        },
      ];

      for (const taskData of DATASET_FOR_TASKS_CREATING) {
        const creatingTasksData = await request(app.getHttpServer())
          .post('/task')
          .send(taskData)
          .set('Authorization', `Bearer ${token}`);

        CREATED_TASKS_IDS.push(creatingTasksData.body._id);
      }

      DATASET_FOR_FILTERS_CHECKING.forEach(async (dataset) => {
        const response = await request(app.getHttpServer())
          .get('/task')
          .query(dataset.inputParams)
          .set('Authorization', `Bearer ${token}`);

        const title = DATASET_FOR_TASKS_CREATING[dataset.objectIndex].title;

        expect(response.body.tasks[0].title).toEqual(title);
      });

      // // testing querying by category
      // const res = await request(app.getHttpServer())
      //   .get(`/task?categories=["${createdCategoryId}"]`)
      //   .set('Authorization', `Bearer ${token}`);

      // console.log(res.body);
      // expect(res.body.tasks[0].title).toEqual(
      //   DATASET_FOR_TASKS_CREATING[0].title,
      // );
      // //

      await request(app.getHttpServer())
        .delete(`/category/${createdCategoryId}`)
        .set('Authorization', `Bearer ${token}`);

      CREATED_TASKS_IDS.forEach(async (el) => {
        await request(app.getHttpServer())
          .delete(`/task/${el}`)
          .set('Authorization', `Bearer ${token}`);
      });
    });
  });

  describe('/task/:id (PATCH)', () => {
    let categoryId: string;

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

    it('should set dateOfCompletion if isCompleted is true', async () => {
      const updatedTask = {
        isCompleted: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/task/${task._id}`)
        .send(updatedTask)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.dateOfCompletion).toBeDefined();
    });

    it('should set dateOfCompletion to null if isCompleted is false', async () => {
      const updatedTask = {
        isCompleted: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/task/${task._id}`)
        .send(updatedTask)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.dateOfCompletion).toBeNull();
    });

    it('should return an error with 400 status code when request url provided with invalid taskId', async () => {
      const updatedTask = {
        title: 'task',
        description: 'description',
      };
      const response = await request(app.getHttpServer())
        .patch(`/task/undefined`)
        .send(updatedTask)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });

    it('should add to the task category correctly', async () => {
      const categoryData = {
        title: 'test',
        color: 'red',
      };

      const createCategoryResponse = await request(app.getHttpServer())
        .post('/category')
        .send(categoryData)
        .set('Authorization', `Bearer ${token}`);

      categoryId = createCategoryResponse.body._id;

      const updateTaskResponse = await request(app.getHttpServer())
        .patch(`/task/${task._id}`)
        .send({
          categories: [createCategoryResponse.body._id],
        })
        .set('Authorization', `Bearer ${token}`);

      expect(createCategoryResponse.statusCode).toBe(201);
      expect(updateTaskResponse.statusCode).toBe(200);
      expect(updateTaskResponse.body.categories[0]).toEqual({
        ...createCategoryResponse.body,
        __v: 0,
      });
    });

    it('after category deleting should delete it from task', async () => {
      const deletecategoryResponse = await request(app.getHttpServer())
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`);

      const getTaskResponse = await request(app.getHttpServer())
        .get(`/task/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getTaskResponse.body.categories.length).toBe(0);
      expect(deletecategoryResponse.statusCode).toBe(204);
    });

    it('should return an error when request url provided with non-existing categoryId', async () => {
      const updatedTask = {
        categories: ['ghjghjghj'],
      };
      const response = await request(app.getHttpServer())
        .patch(`/task/652461519fd85ce71a666e77`)
        .send(updatedTask)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
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

      const deletedTask = await request(app.getHttpServer())
        .get(`/task/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);
      expect(deletedTask.statusCode).toBe(404);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete('/user')
      .set('Authorization', `Bearer ${token}`);

    await app.close();
  });
});
