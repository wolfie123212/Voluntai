CREATE TABLE `volunteer_actions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `opportunity_id` integer NOT NULL REFERENCES `opportunities`(`id`) ON DELETE CASCADE,
  `org_id` integer NOT NULL REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  `clicked_at` text,
  `completed_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(`user_id`, `opportunity_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_va_user` ON `volunteer_actions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_va_completed` ON `volunteer_actions` (`completed_at`);
--> statement-breakpoint
CREATE INDEX `idx_va_org` ON `volunteer_actions` (`org_id`);
