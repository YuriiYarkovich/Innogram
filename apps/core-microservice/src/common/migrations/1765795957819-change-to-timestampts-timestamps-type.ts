import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeToTimestamptsTimestampsType1765795957819 implements MigrationInterface {
    name = 'ChangeToTimestamptsTimestampsType1765795957819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "provider_id"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles_follows" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles_follows" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comment_mentions" DROP COLUMN "CreatedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."comment_mentions" ADD "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "main"."message_assets" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."message_assets" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."post_assets" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."post_assets" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "main"."post_assets" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."post_assets" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."chats" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "main"."chats" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."message_assets" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."message_assets" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comments" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."comments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."comment_mentions" DROP COLUMN "CreatedAt"`);
        await queryRunner.query(`ALTER TABLE "main"."comment_mentions" ADD "CreatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles_follows" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "main"."profiles_follows" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "main"."profiles" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "auth"."users" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "auth"."accounts" ADD "provider_id" character varying(255)`);
    }

}
