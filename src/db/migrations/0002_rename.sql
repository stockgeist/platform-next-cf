ALTER TABLE `invoices` RENAME TO `invoice`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`package_id` text NOT NULL,
	`amount` integer NOT NULL,
	`vat_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`status` text NOT NULL,
	`payment_intent_id` text NOT NULL,
	`vat_number` text,
	`country` text NOT NULL,
	`is_business` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invoice`("id", "user_id", "package_id", "amount", "vat_amount", "total_amount", "currency", "status", "payment_intent_id", "vat_number", "country", "is_business", "created_at", "updated_at") SELECT "id", "user_id", "package_id", "amount", "vat_amount", "total_amount", "currency", "status", "payment_intent_id", "vat_number", "country", "is_business", "created_at", "updated_at" FROM `invoice`;--> statement-breakpoint
DROP TABLE `invoice`;--> statement-breakpoint
ALTER TABLE `__new_invoice` RENAME TO `invoice`;--> statement-breakpoint
PRAGMA foreign_keys=ON;