# 💎 Kyro System Backend

Sistema backend para la gestión integral de producción, inventario, costeo y catálogo de piezas de joyería. 

---

## 🚀 Tecnologías

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL

---

## 🧠 Descripción del sistema

Kyro es un sistema tipo ERP enfocado en la industria de joyería, que permite:

* Gestión de usuarios y roles
* Control de proveedores
* Administración de materiales, metales y acabados
* Catálogo de piezas y variantes
* Sistema de costeo por pieza
* Inventario y trazabilidad
* Historial de precios y movimientos

---

## 🏗️ Arquitectura del proyecto

```
src/
 ├── controllers/
 ├── routes/
 ├── middlewares/
 ├── services/
 ├── db/
 └── index.js
```

---

## 🔐 Autenticación

El sistema utiliza JWT para proteger rutas.

### Headers requeridos:

```
Authorization: Bearer <token>
```

---

## 📦 Módulos principales

### 👤 Usuarios y Roles

* Registro y login
* Roles dinámicos (Administrador, Producción, etc.)
* Middleware de autorización

---

### 📚 Catálogos

* Proveedores
* Materiales
* Metales
* Acabados
* Colecciones
* Tipos de pieza

---

### 💍 Piezas

* Creación de piezas
* SKU por variante
* Relación con colección y tipo

---

### 🧮 Costeo

* Materiales utilizados
* Metales por gramo
* Acabados
* Mano de obra
* Gastos aplicados

---

### 📊 Inventario

* Entradas
* Salidas
* Ajustes
* Mermas

---

## ⚙️ Instalación

```bash
git clone <repo-url>
cd kyro-system-back
npm install
```

---

## 🔧 Variables de entorno

Crear archivo `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kyro
JWT_SECRET=super_secret_key
PORT=4000
```

---

## 🧪 Ejecución en desarrollo

```bash
npm run dev
```

Servidor:

```
http://localhost:4000
```

---

## 📮 Ejemplo de registro (Postman)

```json
{
  "nombre": "Erick",
  "apellido": "Barbosa",
  "email": "admin@kyro.com",
  "password": "123456",
  "rolId": "UUID_DEL_ROL"
}
```

---

## 🧭 Estado del proyecto

🟡 En desarrollo activo
✔ Auth + roles implementado
✔ Prisma schema completo
⏳ Catálogos en construcción
⏳ Piezas y costeo pendiente

---


## 🧑‍💻 Autor

Desarrollado por Erick 🚀
Proyecto académico / profesional de ingeniería de sistemas.
