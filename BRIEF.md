# BUTELLA — Full-Stack E-commerce Development

You are a senior full-stack developer, software architect, UI/UX designer, and security engineer.

Your task is to build a complete, production-ready e-commerce website for BUTELLA, a women's clothing boutique located in Kyzylorda, Kazakhstan.

I am not a programmer. I will rely on you to implement the entire project, including frontend, backend, database, integrations, testing, and deployment preparation.

You must write the actual working code, not just provide examples or explanations.

## 1. PROJECT OBJECTIVE

Build a modern, elegant, premium-looking women's fashion online store.

The website must allow customers to:
- Browse clothing products.
- View product details and photographs.
- Select sizes and colors.
- Add multiple products to a shopping cart.
- Update quantities and remove products.
- Place orders.
- Choose store pickup or delivery.
- Pay using Kaspi.

The store owner must be able to manage products easily without editing code.

All new orders and payment notifications must be delivered to the owner's private Telegram bot.

There is NO requirement for a complicated analytics dashboard or a separate order-management administration system.

## 2. TECHNOLOGY STACK

Use the following technologies:

- Next.js (App Router).
- TypeScript.
- Tailwind CSS.
- Supabase PostgreSQL.
- Supabase Storage for product images.
- Supabase Auth for owner authentication.
- Supabase Edge Functions or secure server-side API routes.
- Telegram Bot API for notifications.
- Vercel for deployment.
- GitHub for version control.

Use stable, compatible dependencies.

## 3. DESIGN AND USER EXPERIENCE

Create a completely new visual identity and website design.

Design direction:
- Premium women's fashion boutique.
- Minimalist and elegant.
- Editorial fashion aesthetic.
- Clean layouts and generous whitespace.
- Beautiful typography.
- High-quality product photography.
- Smooth but subtle animations.
- Sophisticated color palette.

Avoid:
- Generic AI-generated website appearance.
- Excessive gradients.
- Overloaded layouts.
- Unnecessary decorative elements.
- Generic dashboard aesthetics.

The website must be fully responsive and mobile-first.

The mobile experience is extremely important because most customers will arrive from Instagram.

Support Russian and Kazakh text. Structure the application so English can be added later.

## 4. WEBSITE PAGES

Create:

1. Homepage.
2. Product catalog.
3. Product detail page.
4. Shopping cart.
5. Checkout page.
6. Order confirmation page.
7. Protected product management page at /manage.

The homepage should include:
- Brand identity.
- Hero section.
- Featured products.
- New arrivals.
- Product categories.
- Instagram link.
- Store contact information.
- Delivery information.

## 5. PRODUCT MANAGEMENT

The owner is not technically experienced.

Create a very simple, password-protected product management interface.

The owner must be able to:
- Add new products.
- Upload multiple product photographs.
- Set product names and descriptions.
- Set prices.
- Select categories.
- Add sizes and colors.
- Set stock quantities.
- Edit existing products.
- Delete or hide products.
- Mark products as unavailable.

Make the interface intuitive enough for someone who has never managed an online store before.

Never require the owner to modify source code to manage products.

This is a lightweight product editor, not a complex administrative dashboard.

## 6. SHOPPING CART AND CHECKOUT

Implement a fully functional shopping cart.

Requirements:
- Multiple products per order.
- Persistent cart between page reloads.
- Product size and color selection.
- Quantity controls.
- Automatic subtotal and total calculations.
- Stock availability validation.

Checkout form:
- Customer name.
- Phone number.
- Delivery method.
- Delivery address when necessary.
- Optional order comment.

Delivery methods:
1. Store pickup in Kyzylorda.
2. Local delivery in Kyzylorda.
3. Delivery to other cities in Kazakhstan.

Delivery prices must be configurable. Do not invent delivery prices.

Validate all customer input.

Recalculate prices and verify product availability on the server. Never trust prices submitted by the browser.

## 7. DATABASE

Create a proper relational database structure.

Required entities:
- products
- product_images
- product_variants
- orders
- order_items
- payment_transactions
- admin_users

Orders must store:
- Unique order number.
- Customer information.
- Products and their quantities.
- Selected sizes and colors.
- Final price.
- Delivery method.
- Delivery address.
- Payment status.
- Order status.
- Creation timestamp.

Use database migrations.

Enable Row Level Security and create appropriate policies.

Public customers must never be able to retrieve other customers' orders or private contact information.

Only authenticated authorized owners may manage products.

Keep all privileged credentials on the server.

## 8. TELEGRAM BOT INTEGRATION

Create a Telegram notification integration.

The owner must receive a message whenever:
- A new order is created.
- A payment is confirmed.
- An order is cancelled.

Order notification must contain:
- Order number.
- Customer name.
- Customer phone.
- Ordered products.
- Sizes and colors.
- Quantities.
- Total amount.
- Delivery method.
- Delivery address.
- Payment status.

Add inline Telegram buttons where appropriate:
- Confirm payment.
- Mark as processing.
- Mark as shipped.
- Complete order.
- Cancel order.

Button actions must securely update the corresponding database record.

Only the authorized owner's Telegram account may execute management actions.

Use Telegram Bot API securely.

Never expose the Telegram bot token in frontend code.

Implement error handling and prevent duplicate notifications.

## 9. KASPI PAYMENT INTEGRATION

Kaspi is the initial payment method.

IMPORTANT:
Do not invent a Kaspi API or assume that a public direct API is available.

Design a payment-provider abstraction so additional payment methods can be added later.

Initial payment flow:

1. Customer submits an order.
2. Backend creates the order with PENDING_PAYMENT status.
3. Customer receives the available Kaspi payment instructions or payment link.
4. The payment is verified.
5. The order changes to PAID.
6. The owner receives a Telegram notification.

Investigate official Kaspi Pay integration options first.

If an authorized payment integration is unavailable, implement a safe manual confirmation workflow.

You may investigate third-party Kaspi payment providers, but do not connect one without explicit configuration and approval.

Never mark an order as paid based only on a screenshot, browser redirect, or customer-submitted claim.

Validate payment notifications server-side.

Keep the payment layer extensible for future Visa and other bank-card payment providers.

Do not store card numbers or CVV information.

## 10. SECURITY

Implement:
- Secure owner authentication.
- Server-side authorization.
- Row Level Security.
- Protected product management.
- Secure secret storage.
- Input validation.
- Rate limiting for public order creation.
- Payment verification.
- Telegram webhook authorization.
- Protection against unauthorized order access.

Never expose:
- Telegram bot tokens.
- Supabase service-role keys.
- Payment API keys.
- Database passwords.

Use environment variables and provide an .env.example file with placeholder values only.

## 11. DEVELOPMENT REQUIREMENTS

You are responsible for implementing the actual project.

Do not create a static mockup pretending to be a working store.

Do not use fake products or fake payment confirmations in production.

Do not leave important functionality as TODO comments.

Write clean, maintainable, modular code.

Use reusable components.

Create meaningful error messages and loading states.

Add appropriate empty states.

## 12. TESTING

Test:
- Product creation and editing.
- Image uploads.
- Shopping cart.
- Checkout.
- Multiple products per order.
- Stock validation.
- Order creation.
- Telegram notifications.
- Payment status changes.
- Owner authorization.
- Unauthorized access attempts.
- Mobile responsiveness.

Fix discovered issues before declaring a feature complete.

## 13. PROJECT DOCUMENTATION

Create:
- README.md
- CLAUDE.md
- .env.example
- Database migration files.
- Deployment instructions.
- Supabase setup instructions.
- Telegram bot setup instructions.
- Product management user guide in Russian.

The documentation must explain how a non-technical store owner can add and edit products.

## 14. WORKFLOW

Work in controlled development phases.

First inspect the current workspace and determine whether an existing project is present.

If the workspace is empty, initialize the project.

Then create a detailed implementation plan.

Implement the project phase by phase:

1. Project initialization and architecture.
2. Design system and frontend.
3. Database and backend.
4. Product management.
5. Shopping cart and checkout.
6. Telegram bot.
7. Kaspi payment integration.
8. Security and testing.
9. Deployment preparation.

After each phase:
- Explain what you implemented.
- Run relevant checks and tests.
- Fix errors.
- Report any external configuration I need to complete.
- Do not pretend an integration works until it has been tested.

Do not ask me to write code manually.

If credentials or external service access are needed, create the integration and explain exactly where I need to obtain and configure them.

Prioritize a secure, functional, maintainable commercial product over unnecessary complexity.

Start by inspecting the workspace and presenting the architecture and implementation plan. Then begin development.