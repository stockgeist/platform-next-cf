ALTER TABLE `user` ADD `billingIsBusiness` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `billingVatNumber` text(255);--> statement-breakpoint
ALTER TABLE `user` ADD `billingCountry` text(2);--> statement-breakpoint
ALTER TABLE `user` ADD `billingAddress` text(1000);