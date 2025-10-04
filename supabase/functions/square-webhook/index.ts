import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Square-Signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const squareWebhookSignatureKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('X-Square-Signature');
    const body = await req.text();

    if (squareWebhookSignatureKey && signature) {
      const encoder = new TextEncoder();
      const data = encoder.encode(squareWebhookSignatureKey + req.url + body);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashBase64 = btoa(String.fromCharCode(...hashArray));

      if (hashBase64 !== signature) {
        console.error('Webhook signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment.created':
      case 'payment.updated': {
        const payment = event.data?.object?.payment;
        const orderId = payment?.order_id;
        const status = payment?.status;

        if (orderId && status === 'COMPLETED') {
          const { data: order } = await fetch(
            `https://connect.squareup.com/v2/orders/${orderId}`,
            {
              headers: {
                'Square-Version': '2024-10-17',
                'Authorization': `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
              },
            }
          ).then(r => r.json());

          const userId = order?.order?.metadata?.user_id;

          if (userId) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await supabase
              .from('subscriptions')
              .update({
                tier: 'premium',
                status: 'active',
                expires_at: expiresAt.toISOString(),
              })
              .eq('user_id', userId);

            console.log(`Subscription activated for user ${userId}`);
          }
        }
        break;
      }

      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data?.object?.subscription;
        const userId = subscription?.metadata?.user_id;
        const status = subscription?.status;

        if (userId) {
          const dbStatus = status === 'ACTIVE' ? 'active' :
                          status === 'CANCELED' ? 'cancelled' : 'expired';

          await supabase
            .from('subscriptions')
            .update({
              status: dbStatus,
              tier: dbStatus === 'active' ? 'premium' : 'free',
            })
            .eq('user_id', userId);

          console.log(`Subscription updated for user ${userId}: ${dbStatus}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});