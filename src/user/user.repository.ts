import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {}

@Injectable()
export class OtpRepository extends Repository<Otp> {}
