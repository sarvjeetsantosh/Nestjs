import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository, OtpRepository } from '../user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import { Otp } from './entities/otp.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,

    @InjectRepository(Otp)
    private otpRepository: OtpRepository,
    private readonly mailService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = await bcrypt.hash(createUserDto.password, 10);

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; user: User }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    console.log('user', user, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = uuidv4().split('-')[0];
    const otpEntity = new Otp();
    otpEntity.otp = otp;
    otpEntity.user = user;
    otpEntity.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await this.otpRepository.save(otpEntity);

    await this.mailService.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `OTP: ${otp}`,
    });
  }

  async resetPassword(otp: string, newPassword: string): Promise<void> {
    const otpEntity = await this.otpRepository.findOne({
      where: { otp, isUsed: false },
      relations: ['user'],
    });
    if (!otpEntity) {
      throw new BadRequestException('Invalid OTP');
    }

    const currentTime = new Date();
    if (currentTime > otpEntity.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    otpEntity.isUsed = true;
    await this.otpRepository.save(otpEntity);

    const user = otpEntity.user;
    user.password = await bcrypt.hash(newPassword, 10); // hash the new password
    await this.userRepository.save(user);
  }
}
