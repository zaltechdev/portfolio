CREATE TABLE `owner` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_username_unique` ON `owner` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `owner_email_unique` ON `owner` (`email`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fullname` text NOT NULL,
	`description` text NOT NULL,
	`github` text NOT NULL,
	`email` text,
	`linkedin` text,
	`photo` blob,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `owner`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`techstack` text NOT NULL,
	`photo` blob,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_profile_id_unique` ON `projects` (`profile_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_title_unique` ON `projects` (`title`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`payloads` text,
	`created_at` integer,
	`expired_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `owner`(`id`) ON UPDATE cascade ON DELETE cascade
);
