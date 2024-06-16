import * as path from "path";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../test/interfaces";

describe("Image controller (e2e)", () => {
  let app: INestApplication;
  const userData: Partial<User> | Promise<User> = {
    username: "clownImage",
    email: "clownImahe@circus.com",
    password: "123456",
  };
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true })
    );
    await app.init();

    const imagePostResponse = await request(app.getHttpServer())
      .post("/user/signup")
      .send(userData);

    token = imagePostResponse.body.token;
    return token;
  });

  describe("/image/avatar (POST)", () => {
    it("should upload an image and return 201 status code", async () => {
      const imagePostAvatarResponse = await request(app.getHttpServer())
        .post("/image/avatar")
        .attach("image", path.join(__dirname, "test.jpg"))
        .set("Authorization", `Bearer ${token}`);

      expect(imagePostAvatarResponse.statusCode).toBe(201);
    });

    it("should return an error if request is provided with invalid file", async () => {
      const imagePostAvatarResponse = await request(app.getHttpServer())
        .post("/image/avatar")
        .attach("image", path.join(__dirname, "pis.pdf"))
        .set("Authorization", `Bearer ${token}`);

      expect(imagePostAvatarResponse.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete("/user")
      .set("Authorization", `Bearer ${token}`);

    await app.close();
  });
});
