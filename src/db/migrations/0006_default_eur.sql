PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoice` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`packageId` text NOT NULL,
	`numberOfCredits` integer NOT NULL,
	`amount` integer NOT NULL,
	`vatAmount` integer NOT NULL,
	`totalAmount` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`status` text NOT NULL,
	`paymentIntentId` text NOT NULL,
	`vatNumber` text,
	`country` text NOT NULL,
	`isBusiness` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invoice`("id", "userId", "packageId", "numberOfCredits", "amount", "vatAmount", "totalAmount", "currency", "status", "paymentIntentId", "vatNumber", "country", "isBusiness", "createdAt", "updatedAt") SELECT "id", "userId", "packageId", "numberOfCredits", "amount", "vatAmount", "totalAmount", "currency", "status", "paymentIntentId", "vatNumber", "country", "isBusiness", "createdAt", "updatedAt" FROM `invoice`;--> statement-breakpoint
DROP TABLE `invoice`;--> statement-breakpoint
ALTER TABLE `__new_invoice` RENAME TO `invoice`;--> statement-breakpoint
PRAGMA foreign_keys=ON;