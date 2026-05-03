# LUPI PET — Tienda de Mascotas

Ecommerce para tienda de mascotas con Node.js + Express + Handlebars + SQLite (sql.js).
Carrito de compras con redirección a WhatsApp.

## Estructura

```
lupi-pet/
├── server.js              # Entrada principal
├── package.json
├── db/
│   ├── database.js       # Base de datos SQLite
│   └── lupi.db         # Archivo de BD (se crea automaticamente)
├── uploads/             # Imagenes de productos
├── routes/
│   ├── index.js         # Rutas de paginas
│   ├── api.js         # API REST (carrito, checkout)
│   └── backoffice.js  # Admin
├── views/
│   └── backoffice/    # Plantillas admin
└── public/
    ├── css/main.css
    └── js/cart.js
```

## Ejecucion

```bash
npm install
npm run dev      # Desarrollo (http://localhost:3000)
npm start       # Produccion
```

## Configuracion

 **WhatsApp**: Edita `routes/api.js` linea 18
 Formato: `521` + 10 digitos (Mexico)

 **Backoffice**: `/backoffice`
 Password: `lupi2025`

## Base de Datos

- SQLite en `db/lupi.db` (sql.js)
- Tablas: `products`, `categories`, `blog_posts`
- Sin datos iniciales - agregar desde backoffice

## Agregar Productos

1. Ir a `/backoffice`
2. Login con contrasena: `lupi2025`
3. Productos > Nuevo Producto
4. Llenar formulario
5. Guardar

## Paginas

| Ruta | Descripcion |
|-----|------------|
| `/` | Inicio |
| `/tienda` | Catalogo |
| `/producto/:id` | Detalle producto |
| `/blog` | Blog |
| `/contacto` | Contacto |
| `/backoffice` | Admin |
| `/api/checkout` | WhatsApp checkout |