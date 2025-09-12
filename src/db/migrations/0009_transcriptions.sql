CREATE TABLE IF NOT EXISTS `transcription` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`teamId` text,
	`r2Key` text NOT NULL,
	`fileName` text NOT NULL,
	`fileSize` integer NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'processing' NOT NULL,
	`transcriptionText` text,
	`errorMessage` text,
	`processedAt` integer,
	`metadata` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transcription_user_id_idx` ON `transcription` (`userId`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transcription_team_id_idx` ON `transcription` (`teamId`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transcription_r2_key_idx` ON `transcription` (`r2Key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transcription_status_idx` ON `transcription` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `transcription_created_at_idx` ON `transcription` (`createdAt`);