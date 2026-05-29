/*
  Warnings:

  - You are about to drop the column `categoria` on the `materiales` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `materiales` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "materiales_categoria_idx";

-- AlterTable
ALTER TABLE "materiales" DROP COLUMN "categoria",
ADD COLUMN     "categoria_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "categorias_material" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_material_nombre_key" ON "categorias_material"("nombre");

-- CreateIndex
CREATE INDEX "materiales_categoria_id_idx" ON "materiales"("categoria_id");

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
