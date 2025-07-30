CREATE TABLE `api_key` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text(255) NOT NULL,
	`keyHash` text(255) NOT NULL,
	`prefix` text(8) NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`lastUsedAt` integer,
	`expiresAt` integer,
	`permissions` text(1000),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `api_key_user_id_idx` ON `api_key` (`userId`);--> statement-breakpoint
CREATE INDEX `api_key_prefix_idx` ON `api_key` (`prefix`);--> statement-breakpoint
CREATE INDEX `api_key_hash_idx` ON `api_key` (`keyHash`);--> statement-breakpoint
CREATE INDEX `api_key_active_idx` ON `api_key` (`isActive`);