PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`updateCounter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text(255),
	`lastName` text(255),
	`email` text(255) NOT NULL,
	`passwordHash` text,
	`role` text DEFAULT 'user' NOT NULL,
	`emailVerified` integer,
	`signUpIpAddress` text(100),
	`googleAccountId` text(255),
	`avatar` text(600),
	`currentCredits` integer DEFAULT 0 NOT NULL,
	`lastCreditRefreshAt` integer,
	`is_business` integer DEFAULT false NOT NULL,
	`vatNumber` text(255),
	`country` text(2)
);
--> statement-breakpoint
INSERT INTO `__new_user`("createdAt", "updatedAt", "updateCounter", "id", "firstName", "lastName", "email", "passwordHash", "role", "emailVerified", "signUpIpAddress", "googleAccountId", "avatar", "currentCredits", "lastCreditRefreshAt", "is_business", "vatNumber", "country") SELECT "createdAt", "updatedAt", "updateCounter", "id", "firstName", "lastName", "email", "passwordHash", "role", "emailVerified", "signUpIpAddress", "googleAccountId", "avatar", "currentCredits", "lastCreditRefreshAt", "is_business", "vatNumber", "country" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `google_account_id_idx` ON `user` (`googleAccountId`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `user` (`role`);