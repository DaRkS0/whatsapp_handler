import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  WEBHOOK_VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
} from "$env/static/private";

export const GET: RequestHandler = ({ url }) => {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge);
  }

  return new Response("Forbidden", { status: 403 });
};

// export const POST: RequestHandler = async ({ request }) => {
//   const body = await request.json();

//   console.log("Webhook received:", JSON.stringify(body, null, 2));

//   // Example: auto-reply to first message (template required for first message)
//   if (body.entry) {
//     const changes = body.entry[0]?.changes;
//     if (changes) {
//       const messages = changes[0]?.value?.messages;
//       if (messages && messages.length > 0) {
//         const from = messages[0].from; // sender wa_id
//         await sendTemplateMessage(from);
//       }
//     }
//   }

//   return json({ success: true });
// };

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  console.log("Webhook:", JSON.stringify(body, null, 2));

  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  // Ignore delivery/read statuses
  if (value?.statuses) {
    return json({ ok: true });
  }

  const message = value?.messages?.[0];
  if (!message) {
    return json({ ok: true });
  }

  // Only respond to user messages (text, image, etc.)
  if (!["text", "image", "audio", "video", "document"].includes(message.type)) {
    return json({ ok: true });
  }

  const from = message.from; // wa_id (phone without +)

  const text = message.text?.body?.toLowerCase();
  const button = message.button?.payload;

  await sendTemplateMessage(from);

  return json({ success: true });
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
            language: { code: "en_US" },
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
