CREATE TABLE `city_visits_daily` (
  `day` text NOT NULL,
  `country` text NOT NULL,
  `region` text NOT NULL,
  `city` text NOT NULL,
  `views` integer NOT NULL DEFAULT 0,
  `signins` integer NOT NULL DEFAULT 0,
  PRIMARY KEY (`day`, `country`, `region`, `city`)
);
--> statement-breakpoint
CREATE INDEX `idx_cvd_day` ON `city_visits_daily` (`day`);
