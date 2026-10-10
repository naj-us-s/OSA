CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"activity_type" text NOT NULL,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"poster_url" text,
	"synopsis" text,
	"year" integer,
	"creator" text,
	"genres" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_episodes" integer,
	"total_chapters" integer,
	"total_volumes" integer,
	"total_pages" integer,
	"status" text DEFAULT 'planned' NOT NULL,
	"favorite" integer DEFAULT 0 NOT NULL,
	"rating" smallint,
	"notes" text,
	"current_episode" integer,
	"current_chapter" integer,
	"current_volume" integer,
	"current_page" integer,
	"external_source" text DEFAULT 'manual' NOT NULL,
	"external_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" text,
	"priority" smallint DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vocab_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expression" text NOT NULL,
	"language" text NOT NULL,
	"language_name" text,
	"entry_type" text DEFAULT 'general' NOT NULL,
	"pronunciation" text,
	"romanization" text,
	"context" text,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"learning_status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vocab_meanings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"definition" text NOT NULL,
	"nuance" text,
	"example" text,
	"translation" text,
	"part_of_speech" text,
	"source" text DEFAULT 'user' NOT NULL,
	"order_index" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vocab_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"outcome" smallint NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_activity" ADD CONSTRAINT "media_activity_item_id_media_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vocab_meanings" ADD CONSTRAINT "vocab_meanings_entry_id_vocab_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."vocab_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vocab_reviews" ADD CONSTRAINT "vocab_reviews_entry_id_vocab_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."vocab_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_starts_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_activity_item_idx" ON "media_activity" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_activity_at_idx" ON "media_activity" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_status_idx" ON "media_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_category_idx" ON "media_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_updated_idx" ON "media_items" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_external_uniq" ON "media_items" USING btree ("external_source","external_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_due_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_lang_idx" ON "vocab_entries" USING btree ("language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_status_idx" ON "vocab_entries" USING btree ("learning_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_expr_idx" ON "vocab_entries" USING btree ("expression");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_meanings_entry_idx" ON "vocab_meanings" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_reviews_entry_idx" ON "vocab_reviews" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vocab_reviews_at_idx" ON "vocab_reviews" USING btree ("reviewed_at");