CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `template` (
	`project` text NOT NULL,
	`name` text NOT NULL,
	`template` text,
	`variables` text DEFAULT '[]' NOT NULL,
	`description` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	PRIMARY KEY(`name`, `project`),
	FOREIGN KEY (`project`) REFERENCES `project`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'superadmin' NOT NULL,
	`last_login` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `_kvs` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_kvs_key_unique` ON `_kvs` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `_kvs_value_unique` ON `_kvs` (`value`);