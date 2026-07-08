import { MigrationInterface, QueryRunner } from 'typeorm';

export class DBInit1778675578605 implements MigrationInterface {
  name = 'DBInit1778675578605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "auth"`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "main"`);
    await queryRunner.query(
      `CREATE TABLE "auth"."accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255), "provider" character varying(20) NOT NULL DEFAULT 'local', "last_login_at" TIMESTAMP, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "auth"."users_role_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "auth"."users_role_enum" NOT NULL DEFAULT 'user', "disabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."profiles_follows_status_enum" AS ENUM('accepted', 'rejected', 'requested', 'notSubscribed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."profiles_follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "follower_profile_id" uuid NOT NULL, "followed_profile_id" uuid NOT NULL, "status" "main"."profiles_follows_status_enum" NOT NULL DEFAULT 'accepted', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_32580493d46f0f04500d87560ee" UNIQUE ("follower_profile_id", "followed_profile_id"), CONSTRAINT "PK_2afda6a64450b244f2afc2340f6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."post_assets_type_enum" AS ENUM('image', 'video')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."post_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "type" "main"."post_assets_type_enum" NOT NULL, "hashed_filename" text NOT NULL, "order" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ed08ca38aaa5e342de73e419b33" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."comment_mentions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment_id" uuid NOT NULL, "mentioned_profile_id" uuid NOT NULL, "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_96cd7c00d35e056fcebb7725e02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."comment_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment_id" uuid NOT NULL, "profile_id" uuid NOT NULL, CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."comments_status_enum" AS ENUM('active', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "parent_comment_id" uuid, "profile_id" uuid NOT NULL, "content" text NOT NULL, "status" "main"."comments_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."posts_status_enum" AS ENUM('active', 'archived', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "content" text NOT NULL, "status" "main"."posts_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "archived_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."message_assets_type_enum" AS ENUM('image', 'video')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."message_assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "type" "main"."message_assets_type_enum" NOT NULL, "hashed_file_name" text NOT NULL, "order" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f7b9bbeae429a2a0e8b6356b1f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."messages_receiver_read_status_enum" AS ENUM('read', 'unread')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."messages_receiver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiver_id" uuid NOT NULL, "message_id" uuid NOT NULL, "read_status" "main"."messages_receiver_read_status_enum" NOT NULL DEFAULT 'unread', CONSTRAINT "PK_b561864743d235f44e70addc1f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."messages_visible_status_enum" AS ENUM('active', 'edited', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "reply_to_message_id" uuid, "content" text NOT NULL, "visible_status" "main"."messages_visible_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."chats_chat_type_enum" AS ENUM('private', 'group')`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."chats_chat_status_enum" AS ENUM('active', 'archived', 'deleted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_type" "main"."chats_chat_type_enum" NOT NULL DEFAULT 'private', "chat_status" "main"."chats_chat_status_enum" NOT NULL DEFAULT 'active', "title" character varying(255), "chat_avatar_filename" character varying(512), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "main"."chat_participants_role_enum" AS ENUM('participant', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."chat_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "chat_id" uuid NOT NULL, "role" "main"."chat_participants_role_enum" NOT NULL DEFAULT 'participant', CONSTRAINT "PK_ebf68c52a2b4dceb777672b782d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "username" character varying(50) NOT NULL, "display_name" character varying(100) NOT NULL, "birthday" date, "bio" text, "avatar_filename" character varying(500), "is_public" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_d1ea35db5be7c08520d70dc03f8" UNIQUE ("username"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "main"."post_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "post_id" uuid NOT NULL, "profile_id" uuid NOT NULL, CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."accounts" ADD CONSTRAINT "FK_3000dad1da61b29953f07476324" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles_follows" ADD CONSTRAINT "FK_722f4fb48096271c96380c6278c" FOREIGN KEY ("follower_profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles_follows" ADD CONSTRAINT "FK_90bd341302feb51c5eaa57aab32" FOREIGN KEY ("followed_profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_assets" ADD CONSTRAINT "FK_ae3495fdc7a04ae0a3ed29c0370" FOREIGN KEY ("post_id") REFERENCES "main"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_mentions" ADD CONSTRAINT "FK_9ac3fac766fa09176e5c53e4d3f" FOREIGN KEY ("comment_id") REFERENCES "main"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_likes" ADD CONSTRAINT "FK_e987f05d7c7e3a55432dc9a6fc4" FOREIGN KEY ("profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_likes" ADD CONSTRAINT "FK_2073bf518ef7017ec19319a65e5" FOREIGN KEY ("comment_id") REFERENCES "main"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "main"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comments" ADD CONSTRAINT "FK_6b5b121879fe056a71e8e0915c2" FOREIGN KEY ("profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."posts" ADD CONSTRAINT "FK_9dbc2524c6f46641f5e7d107da1" FOREIGN KEY ("profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_assets" ADD CONSTRAINT "FK_11ed3d5b2dfbc265705fff99938" FOREIGN KEY ("message_id") REFERENCES "main"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages_receiver" ADD CONSTRAINT "FK_6bb2025b00aa00fabe7b48a7952" FOREIGN KEY ("receiver_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages_receiver" ADD CONSTRAINT "FK_b01e869288f7b2dc77399fe62bb" FOREIGN KEY ("message_id") REFERENCES "main"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "main"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participants" ADD CONSTRAINT "FK_cf4c73f423b397d6cf85bf5a591" FOREIGN KEY ("profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participants" ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN KEY ("chat_id") REFERENCES "main"."chats"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_likes" ADD CONSTRAINT "FK_9162feff002caed5b107259355c" FOREIGN KEY ("profile_id") REFERENCES "main"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_likes" ADD CONSTRAINT "FK_b40d37469c501092203d285af80" FOREIGN KEY ("post_id") REFERENCES "main"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "main"."post_likes" DROP CONSTRAINT "FK_b40d37469c501092203d285af80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_likes" DROP CONSTRAINT "FK_9162feff002caed5b107259355c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participants" DROP CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."chat_participants" DROP CONSTRAINT "FK_cf4c73f423b397d6cf85bf5a591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages_receiver" DROP CONSTRAINT "FK_b01e869288f7b2dc77399fe62bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."messages_receiver" DROP CONSTRAINT "FK_6bb2025b00aa00fabe7b48a7952"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."message_assets" DROP CONSTRAINT "FK_11ed3d5b2dfbc265705fff99938"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."posts" DROP CONSTRAINT "FK_9dbc2524c6f46641f5e7d107da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comments" DROP CONSTRAINT "FK_6b5b121879fe056a71e8e0915c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_likes" DROP CONSTRAINT "FK_2073bf518ef7017ec19319a65e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_likes" DROP CONSTRAINT "FK_e987f05d7c7e3a55432dc9a6fc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."comment_mentions" DROP CONSTRAINT "FK_9ac3fac766fa09176e5c53e4d3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."post_assets" DROP CONSTRAINT "FK_ae3495fdc7a04ae0a3ed29c0370"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles_follows" DROP CONSTRAINT "FK_90bd341302feb51c5eaa57aab32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "main"."profiles_follows" DROP CONSTRAINT "FK_722f4fb48096271c96380c6278c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth"."accounts" DROP CONSTRAINT "FK_3000dad1da61b29953f07476324"`,
    );
    await queryRunner.query(`DROP TABLE "main"."post_likes"`);
    await queryRunner.query(`DROP TABLE "main"."profiles"`);
    await queryRunner.query(`DROP TABLE "main"."chat_participants"`);
    await queryRunner.query(`DROP TYPE "main"."chat_participants_role_enum"`);
    await queryRunner.query(`DROP TABLE "main"."chats"`);
    await queryRunner.query(`DROP TYPE "main"."chats_chat_status_enum"`);
    await queryRunner.query(`DROP TYPE "main"."chats_chat_type_enum"`);
    await queryRunner.query(`DROP TABLE "main"."messages"`);
    await queryRunner.query(`DROP TYPE "main"."messages_visible_status_enum"`);
    await queryRunner.query(`DROP TABLE "main"."messages_receiver"`);
    await queryRunner.query(
      `DROP TYPE "main"."messages_receiver_read_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "main"."message_assets"`);
    await queryRunner.query(`DROP TYPE "main"."message_assets_type_enum"`);
    await queryRunner.query(`DROP TABLE "main"."posts"`);
    await queryRunner.query(`DROP TYPE "main"."posts_status_enum"`);
    await queryRunner.query(`DROP TABLE "main"."comments"`);
    await queryRunner.query(`DROP TYPE "main"."comments_status_enum"`);
    await queryRunner.query(`DROP TABLE "main"."comment_likes"`);
    await queryRunner.query(`DROP TABLE "main"."comment_mentions"`);
    await queryRunner.query(`DROP TABLE "main"."post_assets"`);
    await queryRunner.query(`DROP TYPE "main"."post_assets_type_enum"`);
    await queryRunner.query(`DROP TABLE "main"."profiles_follows"`);
    await queryRunner.query(`DROP TYPE "main"."profiles_follows_status_enum"`);
    await queryRunner.query(`DROP TABLE "auth"."users"`);
    await queryRunner.query(`DROP TYPE "auth"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "auth"."accounts"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "main"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "auth"`);
  }
}
