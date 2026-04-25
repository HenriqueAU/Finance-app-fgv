import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1777138966209 implements MigrationInterface {
    name = 'CreateInitialSchema1777138966209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "emergency_reserve" numeric(10,2) NOT NULL, "salary" numeric(10,2) NOT NULL, "payday" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "is_essential" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credit_cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "limit" numeric(10,2) NOT NULL, "closing_day" integer NOT NULL, "due_day" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_7749b596e358703bb3dd8b45b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "installments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "total_amount" numeric(10,2) NOT NULL, "installment_amount" numeric(10,2) NOT NULL, "total_months" integer NOT NULL, "start_month" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "categoryId" uuid, "creditCardId" uuid, CONSTRAINT "PK_c74e44aa06bdebef2af0a93da1b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "intentions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "total_amount" numeric(10,2) NOT NULL, "installment_amount" numeric(10,2) NOT NULL, "months" integer NOT NULL, "desired_start_month" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "categoryId" uuid, CONSTRAINT "PK_1bc1d3b1d635e58e9fbd4cc8554" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "due_day" integer, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "categoryId" uuid, "creditCardId" uuid, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_cards" ADD CONSTRAINT "FK_316ec479135fbc369ccf229dd0f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "installments" ADD CONSTRAINT "FK_6ce3503cb22a2a2cf13d002914b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "installments" ADD CONSTRAINT "FK_009342420e708438453145055c4" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "installments" ADD CONSTRAINT "FK_9c0bbac656018b9552decba0910" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "intentions" ADD CONSTRAINT "FK_098f7956d9fedad9d6f5f1f98a4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "intentions" ADD CONSTRAINT "FK_69dff4e7c30e85d7357898fa81d" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_ac0801a1760c5f9ce43c03bacd0" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_61eafcc4466795e2c404cd7b889" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_61eafcc4466795e2c404cd7b889"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_ac0801a1760c5f9ce43c03bacd0"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c"`);
        await queryRunner.query(`ALTER TABLE "intentions" DROP CONSTRAINT "FK_69dff4e7c30e85d7357898fa81d"`);
        await queryRunner.query(`ALTER TABLE "intentions" DROP CONSTRAINT "FK_098f7956d9fedad9d6f5f1f98a4"`);
        await queryRunner.query(`ALTER TABLE "installments" DROP CONSTRAINT "FK_9c0bbac656018b9552decba0910"`);
        await queryRunner.query(`ALTER TABLE "installments" DROP CONSTRAINT "FK_009342420e708438453145055c4"`);
        await queryRunner.query(`ALTER TABLE "installments" DROP CONSTRAINT "FK_6ce3503cb22a2a2cf13d002914b"`);
        await queryRunner.query(`ALTER TABLE "credit_cards" DROP CONSTRAINT "FK_316ec479135fbc369ccf229dd0f"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TABLE "intentions"`);
        await queryRunner.query(`DROP TABLE "installments"`);
        await queryRunner.query(`DROP TABLE "credit_cards"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
