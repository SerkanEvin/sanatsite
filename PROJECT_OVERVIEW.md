# Project Overview: SanatSite

This document provides a comprehensive analysis of the "SanatSite" codebase to assist with development and adjustments.

## 1. Technology Stack

*   **Frontend Framework**: React 18 (via Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (+ Autoprefixer, PostCSS)
*   **Routing**: React Router DOM (v6.22+)
*   **Icons**: Lucide React
*   **HTTP Client**: native `fetch` / `node-fetch`
*   **Backend / Database**: Supabase (PostgreSQL)
*   **Linting**: ESLint (v9)

## 2. Project Structure

### Root Directory
*   `vite.config.ts`: Vite configuration.
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `package.json`: Dependencies and scripts.
*   `*.sql`: Various SQL scripts for database schema management, migrations, and fixes (e.g., `create_customer_accounts.sql`, `fix_profimages_policies.sql`).

### Source Directory (`src/`)

#### Core
*   `App.tsx`: Main application component having the Routing logic and Global Context Providers.
*   `main.tsx`: Application entry point.
*   `index.css`: Global styles and Tailwind directives.
*   `lib/`: Utilities, specifically Supabase client (`supabase.ts`) and database types (`database.types.ts`).

#### Pages (`src/pages/`)
*   **Public Views**:
    *   `HomePage.tsx`: Landing page.
    *   `ArtworksPage.tsx`: Gallery view for artworks.
    *   `ArtworkDetailPage.tsx`: Detailed view of a single artwork.
    *   `ArtistsPage.tsx`: Directory of artists (also handles `/:artistSlug`).
*   **User/Customer**:
    *   `CustomerDashboard.tsx`: User profile and order history.
    *   `CheckoutPage.tsx`: Checkout process.
    *   `OrdersPage.tsx`: List of user orders.
*   **Artist**:
    *   `ArtistDashboard.tsx`: Dashboard for artists to manage their profile and works.
    *   `ArtistApplicationForm.tsx`: Form for users to apply to become artists.
*   **Admin**:
    *   `AdminPanel.tsx`: Comprehensive admin control panel (likely for managing orders, artists, and artworks).

#### Components (`src/components/`)
*   `Header.tsx` / `Footer.tsx`: common layout elements.
*   `AuthModal.tsx`: Authentication (Login/Signup) modal.
*   `CartDrawer.tsx`: Slide-out shopping cart interaction.
*   `DecorativeElements.tsx`: UI enhancements.

#### Contexts (`src/contexts/`)
Global state management is handled via React Context:
*   `AuthContext.tsx`: User authentication state.
*   `CartContext.tsx`: Shopping cart state and logic.
*   `CurrencyContext.tsx`: Handling multiple currencies.
*   `LanguageContext.tsx`: Internationalization (i18n) support.
*   `AdminContext.tsx`: Admin-specific state/permissions.
*   `ToastContext.tsx`: Notification/Toast message system.

## 3. Database Schema
(Derived from `src/lib/database.types.ts`)

The application uses Supabase with the following public tables:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| **`artists`** | Artist profiles | `id`, `user_id`, `name`, `slug`, `bio`, `website`, `instagram` |
| **`artworks`** | Artwork details | `id`, `artist_id`, `title`, `price`, `image_url`, `dimensions`, `is_available`, `orientation` |
| **`categories`** | Art categories | `id`, `name`, `slug` |
| **`cart_items`** | Persistent cart | `id`, `user_id`, `artwork_id`, `quantity`, `size`, `material`, `frame` |
| **`orders`** | Order records | `id`, `user_id`, `total_amount`, `status`, `shipping_address` |
| **`order_items`** | Items in an order | `id`, `order_id`, `artwork_id`, `price`, `size`, `material`, `frame` |
| **`artwork_submissions`** | Artist uploads | `id`, `artist_id`, `image_url`, `status`, `orientation` |

## 4. Key Features & Observations

*   **Dynamic Routing**: The app supports dynamic routes for artists (e.g., `/:artistSlug`) to act as personal portfolio pages.
*   **E-commerce**: Full flow from browsing -> Cart (`CartContext`, `CartDrawer`) -> Checkout (`CheckoutPage`) -> Orders.
*   **Role-Based Access**: Distinct dashboards for Customers, Artists, and Admins.
*   **Internationalization**: Built-in support via `LanguageContext`.
*   **Database Management**: High activity in SQL scripts suggests the database schema is actively evolving/being patched.
