import { Preference } from "mercadopago";
import { MercadoPagoConfig } from "mercadopago";

// Mark this endpoint as server-rendered (required for POST requests)
export const prerender = false;

export async function POST({ request }: any) {
  try {
    // Parse JSON with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown error"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { giftId, giftTitle, giftPrice } = body;

    // Validate input
    if (!giftId || !giftTitle || !giftPrice) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          received: { giftId, giftTitle, giftPrice }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Mercado Pago client
    const accessToken = import.meta.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    console.log("Creating preference for:", { giftId, giftTitle, giftPrice });

    // Create preference
    const preference = new Preference(client);

    const siteUrl = import.meta.env.PUBLIC_SITE || "https://localhost:4321/";

    console.log("back_urls will use siteUrl:", siteUrl);

    const createdPreference = await preference.create({
      body: {
        items: [
          {
            id: giftId,
            title: giftTitle,
            quantity: 1,
            unit_price: giftPrice / 100, // Convert centavos to reais
          },
        ],
        payer: {
          email: "guest@example.com", // Default email for guests
          name: "Convidado",
        },
        back_urls: {
          success: `${siteUrl}success`,
          failure: `${siteUrl}failure`,
          pending: `${siteUrl}pending`,
        },
        auto_return: "approved",
        external_reference: giftId,
      },
    });

    //console.log("Created Mercado Pago preference:", createdPreference);

    // Use sandbox_init_point for testing, init_point for production
    const checkoutUrl = createdPreference.sandbox_init_point || createdPreference.init_point;

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Mercado Pago");
    }

    console.log("Preference created with ID:", createdPreference.id);
    console.log("Checkout URL:", checkoutUrl);

    return new Response(
      JSON.stringify({
        preferenceId: createdPreference.id,
        checkoutUrl: checkoutUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create payment preference",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
