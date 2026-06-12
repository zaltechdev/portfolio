import nodemailer from 'nodemailer';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { env } from '$env/dynamic/private';

interface SendMailOptions<Props extends Record<string, any>> {
	to: string;
	subject: string;
	component: Component<Props>;
	props?: Props;
	from?: string;
}

export async function sendMail<Props extends Record<string, any>>({
	to,
	subject,
	component,
	props,
	from = process.env.SMTP_FROM || '"My Portfolio" <no-reply@example.com>',
}: SendMailOptions<Props>) {
	try {
		const transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: Number(env.SMTP_PORT) || 465,
			secure: env.SMTP_SECURE === 'true', 
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASS
			},
			tls: { rejectUnauthorized: false }
		});

		const { body, head } = render(component, { props: props as Props });
		
		const html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				${head || ''}
			</head>
			<body>
				${body}
			</body>
			</html>
		`;

		const info = await transporter.sendMail({
			from,
			to,
			subject,
			html,
		});

		return info;
	} catch (error) {
		throw error;
	}
}
