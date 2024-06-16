import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import { Task, User } from "../test/interfaces";

describe("Notification/Task controller (e2e)", () => {
  let app: INestApplication;
  let userData: Partial<User> | Promise<User> = {
    username: "clownNotification",
    email: "clownNotification@circus.com",
    password: "123456",
  };
  let userData2: Partial<User> | Promise<User> = {
    username: "clownNotification2",
    email: "clownNotification2@circus.com",
    password: "123456",
  };
  let token: string;
  let token2: string;
  let task: Task;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();

    const notificationPostSignUpResponse = await request(app.getHttpServer())
      .post("/user/signup")
      .send(userData);

    const notificationPostSignUpResponse2 = await request(app.getHttpServer())
      .post("/user/signup")
      .send(userData2);

    token = notificationPostSignUpResponse.body.token;
    token2 = notificationPostSignUpResponse2.body.token;

    const notificationGetResonse = await request(app.getHttpServer())
      .get("/user/me")
      .set("Authorization", `Bearer ${token}`);

    const notificationGetResonse2 = await request(app.getHttpServer())
      .get("/user/me")
      .set("Authorization", `Bearer ${token2}`);

    userData = notificationGetResonse.body;
    userData2 = notificationGetResonse2.body;

    const taskData = {
      title: "task",
      description: "description",
      categories: [],
      isCompleted: false,
      dateOfCompletion: null,
      links: [],
      deadline: null,
      assigneeId: (await userData)._id,
    };

    const notificationTaskPostResponse = await request(app.getHttpServer())
      .post("/task")
      .send(taskData)
      .set("Authorization", `Bearer ${token}`);

    task = notificationTaskPostResponse.body;

    return [token, token2];
  });

  describe("/notification/ (GET)", () => {
    it("should create a subtask for other user and return it with 201 status code and GET notification", async () => {
      const subtaskData = {
        title: "subtask",
        description: "description",
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
        deadline: null,
        assigneeId: (await userData2)._id,
      };

      const notificationSubtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const notificationGetResponse = await request(app.getHttpServer())
        .get("/notification/")
        .set("Authorization", `Bearer ${token2}`);

      for (const key in subtaskData) {
        expect(notificationSubtaskPostResponse.body[key]).toEqual(
          subtaskData[key]
        );
      }
      expect(notificationSubtaskPostResponse.statusCode).toBe(201);
      expect(notificationGetResponse.statusCode).toBe(200);

      await request(app.getHttpServer())
        .delete(`/task/subtask/${notificationSubtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete("/user")
      .set("Authorization", `Bearer ${token}`);

    await request(app.getHttpServer())
      .delete("/user")
      .set("Authorization", `Bearer ${token2}`);

    await app.close();
  });
});
