CREATE TABLE `deployment` (
	`id` text PRIMARY KEY NOT NULL,
	`template_name` text NOT NULL,
	`project_id` text NOT NULL,
	`template` text NOT NULL,
	`variables` text DEFAULT '[]' NOT NULL,
	`description` text,
	`message` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`template_name`,`project_id`) REFERENCES `template`(`name`,`project`) ON UPDATE no action ON DELETE no action
);
