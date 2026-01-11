import { json, type RequestHandler } from "@sveltejs/kit";
import {
  WEBHOOK_VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
} from "$env/static/private";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or specific domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const key = request.headers.get("Authorization");
  console.log("Booth request key:", key);

  //   if (key !== `${WEBHOOK_VERIFY_TOKEN}`) {
  //     return new Response("Forbidden", { status: 403 });
  //   }
  const { type, phone_number, image_url } = await request.json();
  console.log("Booth request body:", { type, phone_number, image_url });
  if (type !== "send_image") {
    await sendTemplateMessage(phone_number);
    return json({ ok: true });
  }

  await sendImageMessage(phone_number, image_url);

  return json({ ok: true });
};

// Function to send a template message
async function sendTemplateMessage(to: string) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: "photo_booth_init", // approved template
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: "Cairo ICT ",
                  },
                  {
                    type: "text",
                    text: "Cairo ICT ",
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Error sending template:", data);
      return;
    }

    console.log("Template sent:", data);
  } catch (err) {
    console.error("Network error:", err);
  }
}

async function sendImageMessage(to: string, link: string) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "image",
          image: {
            link,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Error sending template:", data);
      return;
    }

    console.log("Template sent:", data);
  } catch (err) {
    console.error("Network error:", err);
  }
}
