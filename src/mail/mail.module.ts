import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: Number(configService.get('EMAIL_PORT')),
          secure: false, // set to true if using a secure connection (e.g., port 465)
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [MailerModule], // Export MailerModule if it will be used in other modules
})
export class MailModule {}
