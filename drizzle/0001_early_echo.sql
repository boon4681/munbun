CREATE TABLE `_logs` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_logs_key_unique` ON `_logs` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `_logs_value_unique` ON `_logs` (`value`);