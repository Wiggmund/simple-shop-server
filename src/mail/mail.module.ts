import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: () => {
				return {
					transport: {
						host: process.env.SMTP_HOST,
						port: Number(process.env.SMTP_PORT),
						service: 'gmail',
						secure: true,
						auth: {
							type: 'OAuth2',
							user: process.env.SMTP_USER,
							clientId: process.env.SMTP_CLIENT_ID,
							clientSecret: process.env.SMTP_CLIENT_SECRET,
							refreshToken: process.env.SMTP_REFRESH_TOKEN,
							accessToken: process.env.SMTP_ACCESS_TOKEN,
							accessUrl: process.env.SMTP_ACCESS_URL
						},
						logger: true,
						debug: true,
						tls: {
							rejectUnauthorized: true
						}
					}
				};
			}
		})
	],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
