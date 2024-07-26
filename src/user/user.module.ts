import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository]),
    JwtModule.register({
      secret: 'sakdjfksjdkfs4544dsfsdfsd', // Replace with your secret key
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
