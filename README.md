# 🐾 Lupi Pet — Tienda de Mascotas

Ecommerce para tienda de mascotas con Node.js + Express + Handlebars.
Carrito de compras con redirección a WhatsApp.

## 📁 Estructura del proyecto

```
lupi-pet/
├── server.js              # Entrada principal
├── package.json
├── data/
│   └── products.js        # Productos y blog posts
├── routes/
│   ├── index.js           # Rutas de páginas
│   └── api.js             # API REST (carrito, checkout)
├── views/
│   ├── layouts/
│   │   └── main.hbs       # Layout principal
│   ├── partials/
│   │   ├── navbar.hbs
│   │   └── footer.hbs
│   ├── home.hbs
│   ├── tienda.hbs
│   ├── blog.hbs
│   └── contacto.hbs
└── public/
    ├── css/
    │   └── main.css
    └── js/
        ├── cart.js        # Lógica del carrito
        └── main.js        # Helpers generales
```

## 🚀 Cómo ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar tu número de WhatsApp

Edita **`routes/api.js`** en la línea:
```js
const WA_NUMBER = '5215512345678';
```
Cambia el número por el tuyo. Formato: `521` + 10 dígitos (México).

### 3. Iniciar el servidor

**Producción:**
```bash
npm start
```

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

### 4. Abrir en el navegador
```
http://localhost:3000
```

## 🛠️ Personalización

### Agregar productos
Edita `data/products.js` y agrega objetos al array `products`:
```js
{
  id: 13,
  name: "Nombre del producto",
  category: "alimentos" | "accesorios" | "higiene",
  pet: "perro" | "gato" | "ambos",
  price: 199,
  emoji: "🎁",
  badge: "Nuevo" | null,
  description: "Descripción del producto",
  stock: 20
}
```

### Cambiar colores
Edita las variables CSS en `public/css/main.css`:
```css
:root {
  --orange: #EE5804;   /* Color principal */
  ...
}
```

## 📦 Dependencias
- `express` — Servidor web
- `express-handlebars` — Motor de plantillas

## 🌐 Páginas incluidas
| Ruta | Descripción |
|------|-------------|
| `/` | Inicio con hero, categorías, productos destacados y blog |
| `/tienda` | Catálogo completo con filtros por categoría y mascota |
| `/blog` | Artículos informativos |
| `/contacto` | Formulario de contacto vía WhatsApp |

## 🛒 Funcionamiento del carrito
1. El usuario agrega productos desde cualquier página
2. El carrito se guarda en `localStorage`
3. Al hacer clic en "Pedir por WhatsApp", se genera un mensaje formateado con el pedido
4. Se redirige a WhatsApp con el mensaje prellenado
