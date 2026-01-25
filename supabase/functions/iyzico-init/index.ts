import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Iyzipay from "npm:iyzipay@2.0.61"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user, cartItems, totalAmount, shippingAddress } = await req.json()

    // Initialize Iyzipay
    // NOTE: Set these env variables in your Supabase project (or .env.local for local dev if supported)
    const iyzipay = new Iyzipay({
      apiKey: Deno.env.get('IYZICO_API_KEY') || '',
      secretKey: Deno.env.get('IYZICO_SECRET_KEY') || '',
      uri: Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com'
    });

    // Create a unique basket ID (using timestamp for simplicity, but could be DB ID)
    const basketId = `B${Date.now()}`;
    const conversationId = `C${Date.now()}`;

    // Prepare basket items for Iyzico
    const basketItems = cartItems.map((item: any) => ({
      id: item.artwork_id,
      name: item.artwork.title,
      category1: 'Art',
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: item.price || item.artwork.price
    }));

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: totalAmount,
      paidPrice: totalAmount,
      currency: Iyzipay.CURRENCY.TRY, // Assuming TRY for Iyzico as standard
      basketId: basketId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${req.headers.get('origin')}/payment-result`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: user.id,
        name: shippingAddress.fullName.split(' ')[0],
        surname: shippingAddress.fullName.split(' ').slice(1).join(' ') || 'User',
        gsmNumber: shippingAddress.phone,
        email: shippingAddress.email,
        identityNumber: '11111111111', // Mandatory field, but often dummy for non-citizens or if not collected. Ideally collect TCKN.
        lastLoginDate: '2015-10-05 12:43:35', // Placeholder
        registrationAddress: shippingAddress.address,
        ip: '85.34.78.112', // Ideally get from req headers
        city: shippingAddress.city,
        country: shippingAddress.country,
        zipCode: shippingAddress.zipCode
      },
      shippingAddress: {
        contactName: shippingAddress.fullName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode
      },
      billingAddress: {
        contactName: shippingAddress.fullName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: shippingAddress.zipCode
      },
      basketItems: basketItems
    };

    console.log("Sending request to Iyzico:", JSON.stringify(request));

    return new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          console.error("Iyzico Error:", err);
          resolve(
            new Response(JSON.stringify({ error: err.message }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            })
          )
        } else {
          console.log("Iyzico Result:", result);
          resolve(
            new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            })
          )
        }
      });
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
