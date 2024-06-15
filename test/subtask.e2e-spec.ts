import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import {
  User,
  Task,
  Subtask,
  taskControllerDatasets,
} from "../test/interfaces";

describe("Subtask (Task) controller (e2e)", () => {
  let app: INestApplication;
  let userData: Partial<User> | Promise<User> = {
    username: "clownSubtask",
    email: "clownSubtask@circus.com",
    password: "123456",
  };
  let userData2: Partial<User> | Promise<User> = {
    username: "clownSubtask2",
    email: "clownSubtask2@circus.com",
    password: "123456",
  };
  let token: string;
  let token2: string;
  let categoryId: string;
  let task: Task;
  let subtask: Subtask;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();

    const subtaskPostSignUpResponse = await request(app.getHttpServer())
      .post("/user/signup")
      .send(userData);

    const subtaskPostSignUpResponse2 = await request(app.getHttpServer())
      .post("/user/signup")
      .send(userData2);

    token = subtaskPostSignUpResponse.body.token;
    token2 = subtaskPostSignUpResponse2.body.token;

    const subtaskGetResonse = await request(app.getHttpServer())
      .get("/user/me")
      .set("Authorization", `Bearer ${token}`);

    const subtaskGetResonse2 = await request(app.getHttpServer())
      .get("/user/me")
      .set("Authorization", `Bearer ${token2}`);

    userData = subtaskGetResonse.body;
    userData2 = subtaskGetResonse2.body;

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

    const subtaskTaskPostResponse = await request(app.getHttpServer())
      .post("/task")
      .send(taskData)
      .set("Authorization", `Bearer ${token}`);

    task = subtaskTaskPostResponse.body;

    return [token, token2];
  });

  describe("/task/:taskId/subtask (POST)", () => {
    it("should create a subtask and return it with 201 status code", async () => {
      const subtaskData = {
        title: "subtask",
        description: "description",
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
        deadline: null,
        assigneeId: task._id,
      };

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);
      subtask = subtaskPostResponse.body;

      for (const key in subtaskData) {
        expect(subtaskPostResponse.body[key]).toEqual(subtaskData[key]);
      }
      expect(subtaskPostResponse.statusCode).toBe(201);
    }, 10000);

    it("should create a subtask for other user and return it with 201 status code", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      for (const key in subtaskData) {
        expect(subtaskPostResponse.body[key]).toEqual(subtaskData[key]);
      }
      expect(subtaskPostResponse.statusCode).toBe(201);

      await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 10000);

    taskControllerDatasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const subtaskPostResponse = await request(app.getHttpServer())
          .post(`/task/${task._id}/subtask`)
          .send(dataset.data)
          .set("Authorization", `Bearer ${token}`);

        expect(subtaskPostResponse.statusCode).toBeGreaterThanOrEqual(400);
      });
    }, 10000);
  });

  describe("/task/subtask/:id (GET)", () => {
    it("should return a subtask ID", async () => {
      const taskData = {
        title: "task",
        description: "description",
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
        deadline: null,
      };

      const taskPostResponse = await request(app.getHttpServer())
        .post("/task")
        .send(taskData)
        .set("Authorization", `Bearer ${token}`);

      const subtaskData = {
        title: "subtask",
        description: "description",
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
        deadline: null,
        assigneeId: taskPostResponse.body._id,
      };

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${taskPostResponse.body._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const taskGetResponse = await request(app.getHttpServer())
        .get(`/task/${taskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(taskGetResponse.body.subtasks.toString()).toEqual(
        subtaskPostResponse.body._id
      );

      await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 10000);
  });

  describe("/task//subtask/:id (PATCH)", () => {
    it("should update subtask data and return updated subtask", async () => {
      const updatedSubtask = {
        title: "subtaskNEW",
        description: "descriptionNEW",
        categories: [],
        isCompleted: false,
        dateOfCompletion: null,
        links: [],
        deadline: null,
        assigneeId: task._id,
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtask._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedSubtask) {
        expect(subtaskPatchResponse.body[key]).toEqual(updatedSubtask[key]);
      }
      expect(subtaskPatchResponse.statusCode).toBe(200);
    }, 10000);

    it("should set dateOfCompletion if isCompleted is true", async () => {
      const updatedSubtask = {
        isCompleted: true,
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtask._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      expect(subtaskPatchResponse.body.dateOfCompletion).toBeDefined();
    }, 10000);

    it("should set dateOfCompletion to null if isCompleted is false", async () => {
      const updatedSubtask = {
        isCompleted: false,
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtask._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      expect(subtaskPatchResponse.body.dateOfCompletion).toBeNull();
    }, 10000);

    it("should return an error with 400 status code when request url provided with invalid subtaskId", async () => {
      const updatedSubtask = {
        title: "task",
        description: "description",
      };
      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/undefined`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);
      expect(subtaskPatchResponse.statusCode).toBe(400);
    }, 10000);

    // tests with other user

    it("should work correctly, when user, who give task, do not want to change categories, links and ID", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const updatedSubtask = {
        title: "subtaskNEW",
        description: "descriptionNEW",
        isCompleted: true,
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedSubtask) {
        expect(subtaskPatchResponse.body[key]).toEqual(updatedSubtask[key]);
      }
      expect(subtaskPatchResponse.statusCode).toBe(200);

      await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 10000);

    it("should return no changed subtask, who give task, want to change categories, links and ID", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const categoryData = {
        title: "test",
        color: "red",
      };

      const subtaskCreateCategoryResponse = await request(app.getHttpServer())
        .post("/category")
        .send(categoryData)
        .set("Authorization", `Bearer ${token}`);

      categoryId = subtaskCreateCategoryResponse.body._id;

      const updatedSubtask = {
        categories: [subtaskCreateCategoryResponse.body._id],
        linsk: ["https://www.instagram.com/ivan_anenko/"],
        assigneeId: "123",
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedSubtask) {
        expect(subtaskPatchResponse.body[key]).toEqual(subtaskData[key]);
      }
      expect(subtaskPatchResponse.statusCode).toBe(200);

      await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 10000);

    // TODO fix this tests (problem - you need to confirm subtask notification by using sockets without PATCH)
    //
    // it("should work correctly, when user, who take task, want to change categories, isComplited and links", async () => {
    //   const subtaskData = {
    //     title: "subtask",
    //     description: "description",
    //     categories: [],
    //     isCompleted: false,
    //     dateOfCompletion: null,
    //     links: [],
    //     deadline: null,
    //     assigneeId: (await userData2)._id,
    //   };

    //   const subtaskPostResponse = await request(app.getHttpServer())
    //     .post(`/task/${task._id}/subtask`)
    //     .send(subtaskData)
    //     .set("Authorization", `Bearer ${token}`);

    //   const categoryData = {
    //     title: "test",
    //     color: "red",
    //   };

    //   const subtaskCreateCategoryResponse = await request(app.getHttpServer())
    //     .post("/category")
    //     .send(categoryData)
    //     .set("Authorization", `Bearer ${token2}`);

    //   categoryId = subtaskCreateCategoryResponse.body._id;

    //   const updatedSubtask = {
    //     categories: [subtaskCreateCategoryResponse.body._id],
    //     isCompleted: true,
    //     links: ["https://www.instagram.com/ivan_anenko/"],
    //   };

    //   const subtaskPatchResponse = await request(app.getHttpServer())
    //     .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .send(updatedSubtask)
    //     .set("Authorization", `Bearer ${token2}`);

    //   for (const key in updatedSubtask) {
    //     expect(subtaskPatchResponse.body[key]).toEqual(updatedSubtask[key]);
    //   }
    //   expect(subtaskPatchResponse.statusCode).toBe(200);

    //   await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token}`);
    // });

    // it("should return no changed subtask, when user, who take task, want to change subtask", async () => {
    //   const subtaskData = {
    //     title: "subtask",
    //     description: "description",
    //     categories: [],
    //     isCompleted: false,
    //     dateOfCompletion: null,
    //     links: [],
    //     deadline: null,
    //     assigneeId: (await userData2)._id,
    //   };

    //   const subtaskPostResponse = await request(app.getHttpServer())
    //     .post(`/task/${task._id}/subtask`)
    //     .send(subtaskData)
    //     .set("Authorization", `Bearer ${token}`);

    //   const updatedSubtask = {
    //     title: "subtaskNEW",
    //     description: "descriptionNEW",
    //   };

    //   const subtaskPatchResponse = await request(app.getHttpServer())
    //     .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .send(updatedSubtask)
    //     .set("Authorization", `Bearer ${token2}`);

    //   for (const key in updatedSubtask) {
    //     expect(subtaskPatchResponse.body[key]).toEqual(subtaskData[key]);
    //   }
    //   expect(subtaskPatchResponse.statusCode).toBe(200);

    //   await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token}`);
    // });
  });

  describe("/task/subtask/:id (DELETE)", () => {
    it("should delete a subtask and return 204 status code", async () => {
      const subtaskDeleteResponse = await request(app.getHttpServer())
        .delete(`/task/subtask/${subtask._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(subtaskDeleteResponse.statusCode).toBe(204);
    }, 10000);

    it("should delete a subtask, when user, who give task, want to delete subtask", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const subtaskDeleteResponse = await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(subtaskDeleteResponse.statusCode).toBe(204);
    }, 10000);

    it("should return an error with 400 status code when user, who take task, want to delete subtask", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const subtaskDeleteResponse = await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token2}`);

      expect(subtaskDeleteResponse.statusCode).toBe(400);

      await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 10000);

    it("should delete a subtask, when user, who give task, want to update and after that delete subtask", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const updatedSubtask = {
        title: "subtaskNEW",
        description: "descriptionNEW",
        isCompleted: true,
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      const subtaskDeleteResponse = await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedSubtask) {
        expect(subtaskPatchResponse.body[key]).toEqual(updatedSubtask[key]);
      }
      expect(subtaskPatchResponse.statusCode).toBe(200);
      expect(subtaskDeleteResponse.statusCode).toBe(204);
    }, 10000);

    it("should delete a subtask, when user, who give task, want to update (NO PREMISSION DATA) and after that delete subtask", async () => {
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

      const subtaskPostResponse = await request(app.getHttpServer())
        .post(`/task/${task._id}/subtask`)
        .send(subtaskData)
        .set("Authorization", `Bearer ${token}`);

      const categoryData = {
        title: "test",
        color: "red",
      };

      const subtaskCreateCategoryResponse = await request(app.getHttpServer())
        .post("/category")
        .send(categoryData)
        .set("Authorization", `Bearer ${token}`);

      categoryId = subtaskCreateCategoryResponse.body._id;

      const updatedSubtask = {
        categories: [subtaskCreateCategoryResponse.body._id],
        linsk: ["https://www.instagram.com/ivan_anenko/"],
        assigneeId: "123",
      };

      const subtaskPatchResponse = await request(app.getHttpServer())
        .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
        .send(updatedSubtask)
        .set("Authorization", `Bearer ${token}`);

      const subtaskDeleteResponse = await request(app.getHttpServer())
        .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedSubtask) {
        expect(subtaskPatchResponse.body[key]).toEqual(subtaskData[key]);
      }
      expect(subtaskPatchResponse.statusCode).toBe(200);
      expect(subtaskDeleteResponse.statusCode).toBe(204);
    }, 10000);

    // TODO fix this tests (problem - you need to confirm subtask notification by using sockets without PATCH)
    //
    // it("should return an error with 400 status code when user, who take task, want to update (NO PREMISSION DATA) and after that delete subtask", async () => {
    //   const subtaskData = {
    //     title: "subtask",
    //     description: "description",
    //     categories: [],
    //     isCompleted: false,
    //     dateOfCompletion: null,
    //     links: [],
    //     deadline: null,
    //     assigneeId: (await userData2)._id,
    //   };

    //   const subtaskPostResponse = await request(app.getHttpServer())
    //     .post(`/task/${task._id}/subtask`)
    //     .send(subtaskData)
    //     .set("Authorization", `Bearer ${token}`);

    //   const updatedSubtask = {
    //     title: "subtaskNEW",
    //     description: "descriptionNEW",
    //   };

    //   const subtaskPatchResponse = await request(app.getHttpServer())
    //     .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .send(updatedSubtask)
    //     .set("Authorization", `Bearer ${token2}`);

    //   const subtaskDeleteResponse = await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token2}`);

    //   for (const key in updatedSubtask) {
    //     expect(subtaskPatchResponse.body[key]).toEqual(subtaskData[key]);
    //   }
    //   expect(subtaskPatchResponse.statusCode).toBe(200);
    //   expect(subtaskDeleteResponse.statusCode).toBe(400);

    //   await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token}`);
    // });

    // it("should return an error with 400 status code when user, who take task, want to update and after that delete subtask", async () => {
    //   const subtaskData = {
    //     title: "subtask",
    //     description: "description",
    //     categories: [],
    //     isCompleted: false,
    //     dateOfCompletion: null,
    //     links: [],
    //     deadline: null,
    //     assigneeId: (await userData2)._id,
    //   };

    //   const subtaskPostResponse = await request(app.getHttpServer())
    //     .post(`/task/${task._id}/subtask`)
    //     .send(subtaskData)
    //     .set("Authorization", `Bearer ${token}`);

    //   const categoryData = {
    //     title: "test",
    //     color: "red",
    //   };

    //   const subtaskCreateCategoryResponse = await request(app.getHttpServer())
    //     .post("/category")
    //     .send(categoryData)
    //     .set("Authorization", `Bearer ${token2}`);

    //   categoryId = subtaskCreateCategoryResponse.body._id;

    //   const updatedSubtask = {
    //     categories: [subtaskCreateCategoryResponse.body._id],
    //     isCompleted: true,
    //     links: ["https://www.instagram.com/ivan_anenko/"],
    //   };

    //   const subtaskPatchResponse = await request(app.getHttpServer())
    //     .patch(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .send(updatedSubtask)
    //     .set("Authorization", `Bearer ${token2}`);

    //   const subtaskDeleteResponse = await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token2}`);

    //   for (const key in updatedSubtask) {
    //     expect(subtaskPatchResponse.body[key]).toEqual(updatedSubtask[key]);
    //   }
    //   expect(subtaskPatchResponse.statusCode).toBe(200);
    //   expect(subtaskDeleteResponse.statusCode).toBe(400);

    //   await request(app.getHttpServer())
    //     .delete(`/task/subtask/${subtaskPostResponse.body._id}`)
    //     .set("Authorization", `Bearer ${token}`);
    // });
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
