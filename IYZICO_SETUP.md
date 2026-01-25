# Iyzico Integration Setup Guide

The Iyzico integration has been implemented using **Supabase Edge Functions** for security.

## 1. Prerequisites
Ensure you have the Supabase CLI installed and logged in.
```bash
brew install supabase/tap/supabase
supabase login
```

## 2. Deploy Edge Functions
You need to deploy the two new functions (`iyzico-init` and `iyzico-check`) to your Supabase project.

```bash
supabase functions deploy iyzico-init
supabase functions deploy iyzico-check
```

## 3. Configure Environment Variables
Set the following secrets in your Supabase project dashboard (or via CLI) so the functions can access Iyzico API.

**Required Secrets:**
*   `IYZICO_API_KEY`: Your Iyzico API Key (Sandbox or Production).
*   `IYZICO_SECRET_KEY`: Your Iyzico Secret Key.
*   `IYZICO_BASE_URL`: `https://sandbox-api.iyzipay.com` (for testing) or `https://api.iyzipay.com` (prod).
*   `SUPABASE_URL`: Your Supabase Project URL.
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for creating orders securely).

**Using CLI:**
```bash
supabase secrets set IYZICO_API_KEY=your_key IYZICO_SECRET_KEY=your_secret IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## 4. Testing Locally
To test locally, you need your local Frontend to call the deployed functions.
*   Ensure `VITE_SUPABASE_URL` in your `.env` matches the project where you deployed the functions.
*   Alternatively, to run functions locally:
    ```bash
    supabase start
    supabase functions serve
    ```
    And update your `.env` to point to localhost.

## 5. Flow Overview
1.  **CheckoutPage**: Calls `iyzico-init` -> Returns Payment Form.
2.  **User**: Completes payment on Iyzico iframe/modal.
3.  **Redirect**: User is redirected to `/payment-result`.
4.  **PaymentResultPage**: Calls `iyzico-check` with the token.
5.  **iyzico-check**: Verifies with Iyzico API -> Returns Success -> Frontend shows confirmation.
