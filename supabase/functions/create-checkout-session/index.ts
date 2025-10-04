import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareLocationId = Deno.env.get('SQUARE_LOCATION_ID');

    if (!squareAccessToken || !squareLocationId) {
      return new Response(
        JSON.stringify({
          error: 'Square is not configured. Please add your Square access token and location ID.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const idempotencyKey = crypto.randomUUID();

    const checkoutData = {
      idempotency_key: idempotencyKey,
      checkout: {
        location_id: squareLocationId,
        line_items: [
          {
            name: 'Ditch Premium',
            quantity: '1',
            base_price_money: {
              amount: 299,
              currency: 'USD'
            }
          }
        ],
        subscription_plan_data: {
          subscription_plan_id: Deno.env.get('SQUARE_SUBSCRIPTION_PLAN_ID') || 'monthly_premium',
        },
        redirect_url: `${origin}/?success=true`,
        merchant_support_email: 'support@ditch.app',
        pre_populate_buyer_email: '',
        note: `Premium subscription for user: ${userId}`,
      }
    };

    const response = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-10-17',
        'Authorization': `Bearer ${squareAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Square API error:', data);
      return new Response(
        JSON.stringify({
          error: data.errors?.[0]?.detail || 'Failed to create checkout session',
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        url: data.payment_link?.url,
        checkoutId: data.payment_link?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});