-- CreateEnum
CREATE TYPE "EstadoPieza" AS ENUM ('ACTIVO', 'BORRADOR', 'DESCONTINUADO');

-- CreateEnum
CREATE TYPE "TipoCobro" AS ENUM ('FIJO', 'POR_PIEZA', 'POR_GRAMO', 'POR_LOTE');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'PRODUCCION', 'VENTAS', 'CONSULTA');

-- CreateEnum
CREATE TYPE "TipoProductoAuditoria" AS ENUM ('MATERIAL', 'METAL', 'ACABADO');

-- CreateEnum
CREATE TYPE "Periodicidad" AS ENUM ('SEMANAL', 'MENSUAL', 'ANUAL', 'UNICA');

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "domicilio" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "pagina_web" TEXT,
    "redes_sociales" TEXT,
    "observaciones" TEXT,
    "fecha_registro" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" UUID NOT NULL,
    "proveedor_id" UUID,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT,
    "unidad_compra" TEXT NOT NULL,
    "precio_compra" DECIMAL(12,4) NOT NULL,
    "cantidad_comprada" DECIMAL(12,4) NOT NULL,
    "costo_unitario" DECIMAL(12,4) NOT NULL,
    "stock_disponible" DECIMAL(12,4) NOT NULL,
    "stock_minimo" DECIMAL(12,4) NOT NULL,
    "stock_maximo" DECIMAL(12,4),
    "fecha_compra" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metales" (
    "id" UUID NOT NULL,
    "proveedor_id" UUID,
    "nombre" TEXT NOT NULL,
    "precio_por_gramo" DECIMAL(12,4) NOT NULL,
    "stock_disponible" DECIMAL(12,4) NOT NULL,
    "stock_minimo" DECIMAL(12,4) NOT NULL,
    "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "metales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acabados" (
    "id" UUID NOT NULL,
    "proveedor_id" UUID,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_cobro" "TipoCobro" NOT NULL,
    "costo_base" DECIMAL(12,4) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "acabados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_pieza" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_pieza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colecciones" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "colecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas" (
    "id" UUID NOT NULL,
    "tipo_id" UUID NOT NULL,
    "coleccion_id" UUID NOT NULL,
    "clave" TEXT NOT NULL,
    "nombre_comercial" TEXT NOT NULL,
    "estado" "EstadoPieza" NOT NULL,
    "descripcion" TEXT,
    "peso_total" DECIMAL(12,4),
    "tiempo_fabricacion_hrs" DECIMAL(8,2),
    "imagen_url" TEXT,
    "fecha_creacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas_sku" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "descripcion_variante" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "piezas_sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costeo_materiales" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "cantidad_utilizada" DECIMAL(12,4) NOT NULL,
    "costo_unitario_snapshot" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "costeo_materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costeo_metales" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "metal_id" UUID NOT NULL,
    "peso_utilizado_gr" DECIMAL(12,4) NOT NULL,
    "precio_gramo_snapshot" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "costeo_metales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costeo_acabados" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "acabado_id" UUID NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "costo_unitario_snapshot" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "costeo_acabados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costeo_mano_obra" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "actividad" TEXT NOT NULL,
    "tiempo_hrs" DECIMAL(8,2) NOT NULL,
    "costo_por_hora" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "costeo_mano_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costeo_gastos_aplicados" (
    "id" UUID NOT NULL,
    "pieza_id" UUID NOT NULL,
    "gasto_id" UUID NOT NULL,
    "importe_aplicado" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "costeo_gastos_aplicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_operativos" (
    "id" UUID NOT NULL,
    "concepto" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "monto" DECIMAL(12,4) NOT NULL,
    "periodicidad" "Periodicidad" NOT NULL,
    "fecha" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,

    CONSTRAINT "gastos_operativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_margenes" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "margen_taller" DECIMAL(6,4) NOT NULL,
    "margen_mayorista" DECIMAL(6,4) NOT NULL,
    "margen_publico" DECIMAL(6,4) NOT NULL,
    "descuento_maximo" DECIMAL(6,4),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "configuracion_margenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "email" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_movimientos" (
    "id" UUID NOT NULL,
    "tipo_producto" "TipoProductoAuditoria" NOT NULL,
    "producto_id" UUID NOT NULL,
    "tipo_movimiento" "TipoMovimiento" NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "motivo" TEXT,
    "usuario_id" UUID NOT NULL,
    "fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_precios" (
    "id" UUID NOT NULL,
    "tipo_producto" "TipoProductoAuditoria" NOT NULL,
    "producto_id" UUID NOT NULL,
    "precio_anterior" DECIMAL(12,4) NOT NULL,
    "precio_nuevo" DECIMAL(12,4) NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_cambio" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT,

    CONSTRAINT "historial_precios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "materiales_proveedor_id_idx" ON "materiales"("proveedor_id");

-- CreateIndex
CREATE INDEX "materiales_categoria_idx" ON "materiales"("categoria");

-- CreateIndex
CREATE INDEX "materiales_activo_idx" ON "materiales"("activo");

-- CreateIndex
CREATE INDEX "metales_proveedor_id_idx" ON "metales"("proveedor_id");

-- CreateIndex
CREATE INDEX "acabados_proveedor_id_idx" ON "acabados"("proveedor_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_pieza_codigo_key" ON "tipos_pieza"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "colecciones_codigo_key" ON "colecciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "piezas_clave_key" ON "piezas"("clave");

-- CreateIndex
CREATE INDEX "piezas_coleccion_id_idx" ON "piezas"("coleccion_id");

-- CreateIndex
CREATE INDEX "piezas_tipo_id_idx" ON "piezas"("tipo_id");

-- CreateIndex
CREATE INDEX "piezas_estado_idx" ON "piezas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "piezas_sku_sku_key" ON "piezas_sku"("sku");

-- CreateIndex
CREATE INDEX "piezas_sku_pieza_id_idx" ON "piezas_sku"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_materiales_pieza_id_idx" ON "costeo_materiales"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_materiales_material_id_idx" ON "costeo_materiales"("material_id");

-- CreateIndex
CREATE INDEX "costeo_metales_pieza_id_idx" ON "costeo_metales"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_metales_metal_id_idx" ON "costeo_metales"("metal_id");

-- CreateIndex
CREATE INDEX "costeo_acabados_pieza_id_idx" ON "costeo_acabados"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_acabados_acabado_id_idx" ON "costeo_acabados"("acabado_id");

-- CreateIndex
CREATE INDEX "costeo_mano_obra_pieza_id_idx" ON "costeo_mano_obra"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_gastos_aplicados_pieza_id_idx" ON "costeo_gastos_aplicados"("pieza_id");

-- CreateIndex
CREATE INDEX "costeo_gastos_aplicados_gasto_id_idx" ON "costeo_gastos_aplicados"("gasto_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "inventario_movimientos_tipo_producto_producto_id_idx" ON "inventario_movimientos"("tipo_producto", "producto_id");

-- CreateIndex
CREATE INDEX "historial_precios_tipo_producto_producto_id_idx" ON "historial_precios"("tipo_producto", "producto_id");

-- AddForeignKey
ALTER TABLE "materiales" ADD CONSTRAINT "materiales_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metales" ADD CONSTRAINT "metales_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acabados" ADD CONSTRAINT "acabados_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_pieza"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_coleccion_id_fkey" FOREIGN KEY ("coleccion_id") REFERENCES "colecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_sku" ADD CONSTRAINT "piezas_sku_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_materiales" ADD CONSTRAINT "costeo_materiales_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_materiales" ADD CONSTRAINT "costeo_materiales_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_metales" ADD CONSTRAINT "costeo_metales_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_metales" ADD CONSTRAINT "costeo_metales_metal_id_fkey" FOREIGN KEY ("metal_id") REFERENCES "metales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_acabados" ADD CONSTRAINT "costeo_acabados_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_acabados" ADD CONSTRAINT "costeo_acabados_acabado_id_fkey" FOREIGN KEY ("acabado_id") REFERENCES "acabados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_mano_obra" ADD CONSTRAINT "costeo_mano_obra_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_gastos_aplicados" ADD CONSTRAINT "costeo_gastos_aplicados_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costeo_gastos_aplicados" ADD CONSTRAINT "costeo_gastos_aplicados_gasto_id_fkey" FOREIGN KEY ("gasto_id") REFERENCES "gastos_operativos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_movimientos" ADD CONSTRAINT "inventario_movimientos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios" ADD CONSTRAINT "historial_precios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
