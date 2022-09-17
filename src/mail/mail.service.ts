import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendActivationMail(to: string, link: string) {
		await this.mailerService.sendMail({
			from: `Hello from IMAP API <${process.env.SMTP_USER}>`,
			to,
			subject: `Account activation on - ${process.env.API_URL}`,
			text: '',
			html: `
					<div>
						<h1>Please follow the link to activate your account</h1>
						<a href="${link}">${link}</a>
					</div>
				`
		});
	}
}
