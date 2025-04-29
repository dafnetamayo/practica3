# Práctica 3 Dafne Tamayo León

Una API REST simplificada para un sistema de comercio electrónico construida con Node.js, Express y MongoDB. Esta API implementa autenticación JWT y autorización basada en roles (roles de administrador y cliente).

## Características

- Autenticación de usuarios con tokens JWT
- Autorización basada en roles (admin/cliente)
- Operaciones CRUD para usuarios, productos y pedidos
- Documentación de la API con Swagger

## Requisitos

- Node.js
- Docker (para MongoDB)

```bash
npm install
```

3. Crear un archivo `.env` en el directorio raíz con las siguientes variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

## Configuración de MongoDB con Docker

Para configurar MongoDB usando Docker, ejecuta el siguiente comando:

```bash
docker run -d --name ecommerce-mongo -p 27017:27017 -v ecommerce-data:/data/db mongo
```

Esto creará un contenedor de MongoDB con los siguientes parámetros:
- Nombre: `ecommerce-mongo`
- Puerto: `27017` (puerto estándar de MongoDB)
- Volumen persistente: `ecommerce-data` (para conservar los datos)

Para verificar que el contenedor está en ejecución:

```bash
docker ps
```

## Ejecución de la Aplicación

```bash
# Ejecutar en modo desarrollo (con recarga automática)
npm run dev

# Ejecutar en modo producción
npm start
```

La aplicación web estará disponible en: `http://localhost:3000`
La documentación de la API estará disponible en: `http://localhost:3000/api-docs`

## Ejemplos de Uso con cURL

### Usuarios

#### Registrar un administrador

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@example.com", "password": "Password123", "role": "admin"}'
```

#### Registrar un cliente

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Cliente Regular", "email": "cliente@example.com", "password": "Password123", "role": "client"}'
```

#### Iniciar sesión (obtener token JWT)

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Password123"}'
```

Guarda el token recibido para usarlo en las siguientes solicitudes:

```bash
export TOKEN="el-token-recibido-aquí"
```

#### Obtener todos los usuarios (solo admin)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

#### Obtener un usuario por ID

```bash
curl -X GET http://localhost:3000/api/users/[ID-USUARIO] \
  -H "Authorization: Bearer $TOKEN"
```

#### Actualizar un usuario

```bash
curl -X PUT http://localhost:3000/api/users/[ID-USUARIO] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Nuevo Nombre"}'
```

#### Eliminar un usuario (solo admin)

```bash
curl -X DELETE http://localhost:3000/api/users/[ID-USUARIO] \
  -H "Authorization: Bearer $TOKEN"
```

### Productos

#### Listar productos

```bash
curl -X GET http://localhost:3000/api/products
```

#### Obtener producto por ID

```bash
curl -X GET http://localhost:3000/api/products/[ID-PRODUCTO]
```

#### Crear producto (solo admin)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Producto Nuevo", "description": "Descripción del producto", "price": 1500, "stock": 20, "category": "Categoría"}'
```

#### Actualizar producto (solo admin)

```bash
curl -X PUT http://localhost:3000/api/products/[ID-PRODUCTO] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price": 1800, "stock": 25}'
```

#### Eliminar producto (solo admin)

```bash
curl -X DELETE http://localhost:3000/api/products/[ID-PRODUCTO] \
  -H "Authorization: Bearer $TOKEN"
```

### Pedidos

#### Obtener todos los pedidos del usuario autenticado

```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

#### Crear un nuevo pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"products": [{"productId": "[ID-PRODUCTO]", "quantity": 2}]}'
```

#### Obtener detalles de un pedido específico

```bash
curl -X GET http://localhost:3000/api/orders/[ID-PEDIDO] \
  -H "Authorization: Bearer $TOKEN"
```

## Funcionalidades por Rol

### Administrador
- Gestión completa de usuarios (listar, ver, modificar, eliminar)
- Gestión completa de productos (crear, ver, modificar, eliminar)
- Ver sus propios pedidos

### Cliente
- Ver y modificar su propio perfil
- Ver todos los productos
- Crear y ver sus propios pedidos

## Modelos de Datos

### Usuario
- nombre
- email
- contraseña (encriptada)
- rol (admin/client)

### Producto
- nombre
- descripción
- precio
- stock
- categoría

### Pedido
- idUsuario
- productos (array de IDs de productos con cantidades)
- total
- fecha

-------------------------------------------------------

# RÚBRICA:

Autenticación JWT (/api/users/login)	✓
Autorización por rol (admin/client)	✓
Modelos: User, Product, Order	✓
Documentación con Swagger (/api-docs)	✓
Estructura modular de rutas y middleware	✓
Usuarios (POST /, POST /login, GET, PUT, DELETE)	✓
Productos (GET, POST, PUT, DELETE)	✓
Órdenes (GET, POST, GET /:id)	✓

---------------------------------------------------------

# CONCLUSIONES:

En esta práctica aprendí a crear una API para un sistema de comercio electrónico usando Node.js, Express y MongoDB. Usé Docker para levantar la base de datos, lo cual me ayudó a no complicarme instalando cosas directamente en mi computadora. Implementé registros y logins con JWT, además de roles de administrador y cliente para controlar quién puede hacer qué. También documenté todo con Swagger, lo que hizo mucho más fácil entender cómo funciona la API.

Siento que esta práctica me ayudó mucho a entender cómo se conectan varias tecnologías en un proyecto real. Aprendí a proteger rutas, guardar datos de manera segura y a trabajar con contenedores. Me sirvió para reforzar todo lo que implica hacer un backend moderno, seguro y bien organizado, y también a ver la importancia de documentar lo que uno construye para que otros puedan usarlo sin problemas.

- YA REALICÉ EL IAE :)
