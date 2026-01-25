# Iyzico Integration Setup Guide

The Iyzico integration has been implemented using **Supabase Edge Functions**.

## 1. Prerequisites
Ensure you have the Supabase CLI installed and logged in.
```bash
brew install supabase/tap/supabase
supabase login
```

## 2. Deploy Edge Functions (Recommended)
The easiest way to test is to **deploy the functions to your live Supabase project**. This allows your local website (`localhost`) to communicate with your existing cloud database and the new functions.

Run these commands in your terminal:
```bash
supabase functions deploy iyzico-init
supabase functions deploy iyzico-check
```

## 3. Configure Environment Variables
Set the following secrets in your Supabase project dashboard so the functions can access the Iyzico API.

**Required Secrets:**
*   `IYZICO_API_KEY`: Your Iyzico API Key.
*   `IYZICO_SECRET_KEY`: Your Iyzico Secret Key.
*   `IYZICO_BASE_URL`: `https://sandbox-api.iyzipay.com` (for testing) or `https://api.iyzipay.com` (prod).
*   `SUPABASE_URL`: Your Supabase Project URL (found in your config).
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (from Supabase Dashboard > Settings > API).

**Set Verification:**
You can set these via the CLI:
```bash
supabase secrets set IYZICO_API_KEY=your_key IYZICO_SECRET_KEY=your_secret IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## 4. Run Frontend
You don't need to change your `.env` file if it already points to your Supabase project.
Just start your app normally:
```bash
npm run dev
```
Your local app will now call the **deployed** functions in the cloud.

## 5. Flow Overview
1.  **CheckoutPage**: Calls `iyzico-init` (in the cloud) -> Returns Payment Form.
2.  **User**: Completes payment.
3.  **Redirect**: User is redirected to `/payment-result`.
4.  **PaymentResultPage**: Calls `iyzico-check` (in the cloud).
5.  **iyzico-check**: Verifies payment & creates order in your **existing database**.
