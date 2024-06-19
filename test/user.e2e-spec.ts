import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../test/interfaces";

describe("User controller (e2e)", () => {
  let app: INestApplication;
  const userData: Partial<User> | Promise<User> = {
    username: "clownUser",
    email: "clownUser@circus.com",
    password: "123456",
  };
  let token: string;
  const userDatasets = [
    {
      message: "empty username",
      data: {
        email: "test@gmail.com",
        password: "123456",
      },
    },
    {
      message: "too short username",
      data: {
        username: "а",
        email: "sh@gmail.com",
        password: "123456",
      },
    },
    {
      message: "too long username",
      data: {
        username: "clownclownclownclownclown",
        email: "sh@gmail.com",
        password: "123456",
      },
    },
    {
      message: "invalid type of username",
      data: {
        username: true,
        email: "test@gmail.com",
        password: "123456",
      },
    },
    {
      message: "empty email",
      data: {
        username: "test",
        password: "123456",
      },
    },
    {
      message: "invalid email",
      data: {
        username: "test",
        email: "clown.com",
        password: "123456",
      },
    },
    {
      message: "invalid type of email",
      data: {
        username: "test",
        email: true,
        password: "123456",
      },
    },
    {
      message: "empty password",
      data: {
        username: "test",
        email: "test@gmail.com",
      },
    },
    {
      message: "too short password",
      data: {
        username: "test",
        email: "test@gmail.com",
        password: "12345",
      },
    },
    {
      message: "too long password",
      data: {
        username: "test",
        email: "test@gmail.com",
        password: "123456789012345678901",
      },
    },
    {
      message: "invalid type of password",
      data: {
        username: "test",
        email: "test@gmail.com",
        password: null,
      },
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();
  });

  describe("/user/signup (POST)", () => {
    it("should register new user and return token with 201 status code", async () => {
      const userSignUpResponse = await request(app.getHttpServer())
        .post("/user/signup")
        .send(userData);

      expect(userSignUpResponse.status).toBe(201);
      expect(userSignUpResponse.body).toHaveProperty("token");
      token = userSignUpResponse.body.token;
    });

    userDatasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const userSignUpResponse = await request(app.getHttpServer())
          .post("/user/signup")
          .send(dataset.data);

        expect(userSignUpResponse.status).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe("/user/me (GET)", () => {
    it("should return authorized user's data", async () => {
      const userGetResponse = await request(app.getHttpServer())
        .get("/user/me")
        .set("Authorization", `Bearer ${token}`);

      expect(userGetResponse.body.email).toEqual(userData.email);
    });
  });

  describe("/user/signin (POST)", () => {
    it("should authenticate and authorizate the user and return token", async () => {
      const userGetSignInResponse = await request(app.getHttpServer())
        .post("/user/signin")
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(userGetSignInResponse.status).toBe(201);
      expect(userGetSignInResponse.body).toHaveProperty("token");
    });

    userDatasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const userGetSignInResponse = await request(app.getHttpServer())
          .post("/user/signin")
          .send(dataset.data);

        expect(userGetSignInResponse.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe("/user (PATCH)", () => {
    const userPatchDatasets = [
      {
        message: "too short username",
        data: {
          username: "a",
        },
      },
      {
        message: "too long username",
        data: {
          username: "aaaaaaaaaaaaaaaaaaaaahuy",
        },
      },
      {
        message: "invalid type of username",
        data: {
          username: 123456,
        },
      },
    ];

    it("should update user data and return updated user", async () => {
      const updatedData = {
        username: "updated",
        email: "updated@circus.com",
      };

      const userPatcgResponse = await request(app.getHttpServer())
        .patch("/user")
        .send(updatedData)
        .set("Authorization", `Bearer ${token}`);

      for (const key in updatedData) {
        expect(userPatcgResponse.body[key]).toEqual(updatedData[key]);
      }
    });

    userPatchDatasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const userPatcgResponse = await request(app.getHttpServer())
          .patch("/user")
          .send(dataset.data)
          .set("Authorization", `Bearer ${token}`);

        expect(userPatcgResponse.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe("/user/password (POST)", () => {
    it("should update user password and return updated user", async () => {
      const pastData = {
        oldPassword: userData.password,
        newPassword: "1234567",
      };

      const userPostPasswordResponse = await request(app.getHttpServer())
        .post("/user/password")
        .send(pastData)
        .set("Authorization", `Bearer ${token}`);

      expect(userPostPasswordResponse.statusCode).toBe(200);
    });

    userDatasets.forEach((dataset) => {
      it(`should return an error if request is provided with ${dataset.message}`, async () => {
        const userPostPasswordResponse = await request(app.getHttpServer())
          .patch("/user/password")
          .send(dataset.data)
          .set("Authorization", `Bearer ${token}`);

        expect(userPostPasswordResponse.statusCode).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe("/user (DELETE)", () => {
    it("should delete user with 204 status code", async () => {
      const userDeleteResponse = await request(app.getHttpServer())
        .delete("/user")
        .set("Authorization", `Bearer ${token}`);

      const deletedUser = await request(app.getHttpServer())
        .get("/user/me")
        .set("Authorization", `Bearer ${token}`);

      expect(userDeleteResponse.statusCode).toBe(204);
      expect(deletedUser.statusCode).toBe(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
