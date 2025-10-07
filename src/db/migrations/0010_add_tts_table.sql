CREATE TABLE `tts` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`teamId` text,
	`text` text NOT NULL,
	`voice` text NOT NULL,
	`r2Key` text,
	`fileName` text,
	`fileSize` integer,
	`status` text DEFAULT 'processing' NOT NULL,
	`errorMessage` text,
	`processedAt` integer,
	`metadata` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tts_user_id_idx` ON `tts` (`userId`);--> statement-breakpoint
CREATE INDEX `tts_team_id_idx` ON `tts` (`teamId`);--> statement-breakpoint
CREATE INDEX `tts_r2_key_idx` ON `tts` (`r2Key`);--> statement-breakpoint
CREATE INDEX `tts_status_idx` ON `tts` (`status`);--> statement-breakpoint
CREATE INDEX `tts_created_at_idx` ON `tts` (`createdAt`);