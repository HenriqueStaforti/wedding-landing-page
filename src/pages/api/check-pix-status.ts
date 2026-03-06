import { Payment, MercadoPagoConfig } from "mercadopago";

export const prerender = false;

export async function GET({ url }: any) {
  try {
    const collectionId = url.searchParams.get('collection_id');

    if (!collectionId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing collection_id parameter"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const accessToken = import.meta.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: collectionId });

    console.log("PIX Payment Status Check:", { 
      collectionId, 
      status: paymentData.status,
      isApproved: paymentData.status === 'approved'
    });

    return new Response(
      JSON.stringify({
        status: paymentData.status,
        isApproved: paymentData.status === 'approved',
        paymentId: paymentData.id,
        statusDetail: paymentData.status_detail,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error checking PIX payment status:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to check payment status",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
