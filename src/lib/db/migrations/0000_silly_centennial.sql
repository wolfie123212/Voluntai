CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`expires_at` text,
	`password` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text,
	`target_id` text,
	`before_json` text,
	`after_json` text,
	`reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `enrichment_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`org_id` integer,
	`ok` integer NOT NULL,
	`payload` text,
	`error` text,
	`ran_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`org_id` integer NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`description` text,
	`categories` text,
	`commitment` text,
	`hours_per_week` real,
	`schedule` text,
	`is_remote` integer DEFAULT 0,
	`in_person_address` text,
	`in_person_zip` text,
	`in_person_lat` real,
	`in_person_lon` real,
	`min_age` integer,
	`signup_url` text,
	`source` text,
	`source_id` text,
	`source_url` text,
	`status` text DEFAULT 'published',
	`posted_at` text,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_opp_org` ON `opportunities` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_opp_zip` ON `opportunities` (`in_person_zip`);--> statement-breakpoint
CREATE INDEX `idx_opp_status_expires` ON `opportunities` (`status`,`expires_at`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`ein` text,
	`website` text,
	`email` text,
	`phone` text,
	`description` text,
	`mission` text,
	`logo_r2_key` text,
	`address_line1` text,
	`city` text,
	`state` text,
	`zip` text,
	`lat` real,
	`lon` real,
	`neighborhood` text,
	`categories` text,
	`social_instagram` text,
	`social_facebook` text,
	`social_x` text,
	`is_irs_501c3` integer DEFAULT 0,
	`irs_status` text,
	`is_americorps_grantee` integer DEFAULT 0,
	`americorps_program` text,
	`charity_nav_score` real,
	`charity_nav_stars` integer,
	`charity_nav_url` text,
	`propublica_last_990_year` integer,
	`domain_first_seen` text,
	`admin_verified_by` text,
	`admin_verified_at` text,
	`admin_notes` text,
	`reputability_cached` integer,
	`status` text DEFAULT 'published',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_orgs_zip` ON `organizations` (`zip`);--> statement-breakpoint
CREATE INDEX `idx_orgs_categories` ON `organizations` (`categories`);--> statement-breakpoint
CREATE INDEX `idx_orgs_status` ON `organizations` (`status`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`review_id` integer,
	`org_id` integer,
	`reporter_user_id` text,
	`reporter_email` text,
	`reporter_name` text,
	`reason` text NOT NULL,
	`details` text,
	`status` text DEFAULT 'open',
	`resolution_notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`resolved_at` text,
	FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`org_id` integer NOT NULL,
	`opportunity_id` integer,
	`rating` integer NOT NULL,
	`body` text,
	`volunteered_in_year` integer,
	`status` text DEFAULT 'pending',
	`moderation_flags` text,
	`moderation_score` real,
	`ip_at_post` text,
	`user_agent_at_post` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`published_at` text,
	`removed_reason` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_org_status` ON `reviews` (`org_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_reviews_user` ON `reviews` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT 0,
	`display_name` text,
	`avatar_r2_key` text,
	`age_declared` integer,
	`age_declared_at` text,
	`role` text DEFAULT 'user',
	`banned_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
