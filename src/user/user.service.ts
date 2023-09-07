import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  users = [];

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  find(email: string) {
    return this.users.filter((user) => user.email === email);
  }

  create(username: string, password: string, email: string, avatar: string) {
    this.users.push({
      id: Math.floor(Math.random() * 10000),
      username,
      password,
      email,
      avatar,
    });

    return this.users[this.users.length - 1];
  }

  update() {}

  remove(id: number) {
    this.users = this.users.filter((user) => user.id !== id);

    return 'deleted';
  }
}
