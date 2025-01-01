ALTER TABLE `_logs` RENAME COLUMN `key` TO `id`;--> statement-breakpoint
ALTER TABLE `_logs` RENAME COLUMN `value` TO `message`;--> statement-breakpoint
DROP INDEX IF EXISTS `_logs_key_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `_logs_value_unique`;--> statement-breakpoint
ALTER TABLE `_logs` ADD `tag` text NOT NULL;--> statement-breakpoint
ALTER TABLE `_logs` ADD `status` text NOT NULL;