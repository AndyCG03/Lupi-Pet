# AGENTS.md

## Commands
- `npm install` — Install dependencies
- `npm start` — Production server
- `npm run dev` — Development with hot-reload (nodemon)
- Server runs on `http://localhost:3000`

## WhatsApp Configuration
The WhatsApp number is hardcoded in `routes/api.js:18`. Format: `521` + 10 digits (Mexico). Edit this value to change the checkout redirect number.

## Project Structure
- `server.js` — Entry point
- `db/database.js` — SQLite database (sql.js, no native dependencies)
- `routes/index.js` — Page routes
- `routes/api.js` — Cart/checkout API + WhatsApp integration
- `routes/backoffice.js` — Admin dashboard routes
- `uploads/` — Product images folder
- `views/backoffice/` — Admin templates
- `views/` — Handlebars templates
- `public/js/cart.js` — Client-side cart logic (localStorage)

## Database
- SQLite at `db/lupi.db` (sql.js)
- Tables: `products`, `categories`, `blog_posts`
- Empty on first run - add from backoffice
- Password for backoffice: `lupi2025`

## Backoffice
- URL: `/backoffice`
- Login: `/backoffice/login`
- Manage products, categories, blog posts
- Upload images via `/backoffice/products/new` or edit

## Quirks
- Cart persists in browser localStorage
- Checkout POST to `/api/checkout` returns WhatsApp URL with pre-formatted message
- Products have `id`, `name`, `category_id`, `pet`, `price`, `emoji`, `image`, `badge`, `description`, `stock`, `featured` fields

## Testing
No test framework is configured. Add tests yourself if needed (e.g., jest, mocha).