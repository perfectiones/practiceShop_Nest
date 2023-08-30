import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  findOne(filter: {
    where: { id?: string; username?: string; email?: string };
  }): Promise<User> {
    return this.userModel.findOne({ ...filter });
  }
  /* Создание пользователя и определение, является ли он уникальным
    CreateUserDto - нужен для создания сущности пользователя

  */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<User | { warningMessage: string }> {
    const user = new User();

    // Получение пользователя по Имени
    const existingByUserName = await this.findOne({
      where: { username: createUserDto.username },
    });

    // Получение пользователя по Маилу
    const existingByEmail = await this.findOne({
      where: { email: createUserDto.email },
    });

    // ПРОВЕРКА УНИКАЛЬНОСТИ ПОЛЬЗОВАТЕЛЯ, если метод .findOne нашел что-то, то выражение выдает true

    //Начало проверки
    if (existingByUserName) {
      return { warningMessage: 'Пользователь с таким именем уже существует' };
    }

    if (existingByEmail) {
      return { warningMessage: 'Пользователь с таким email уже существует' };
    }
    //Конец проверки

    //Кэширование пароля
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.email = createUserDto.email;

    //Сохранение пользователя
    return user.save();
  }
}
