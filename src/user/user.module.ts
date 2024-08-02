import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository, OtpRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { Otp } from './entities/otp.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository, Otp, OtpRepository]),
    JwtModule.register({
      secret: 'sakdjfksjdkfs4544dsfsdfsd', // Replace with your secret key
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
