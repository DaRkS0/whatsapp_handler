import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  WEBHOOK_VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
} from "$env/static/private";
import { GetDoc, UpdateDoc } from "$lib/firebase/database/client";

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

  if (["button"].includes(message.type)) {
    const from = message.from; // wa_id (phone without +)

    const button = message.button?.payload;
    if (button === "Tell me how it works") {
      await sendTextMessage(from)
      await sendImageMessage(
        from,
        "https://fra1.digitaloceanspaces.com/ekaterra-test/Vodafone-Summer-2025/smiles.png",
      );

      return json({ success: true });
    }
    if (button === "Get My Photo") {
      const uuser = await GetDoc("adidas", from);

      if (uuser.exists()) {
        const mg = uuser.get("img_status");
        const url = uuser.get("url");

        if (mg === "complete") {
          await sendImageMessage(from, url);
        } else {
          await UpdateDoc("adidas", from, {
            user_status: "waiting",
            img_status: "pending",
          });
        }
      }

      return json({ success: true });
    }
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
      },
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
            name: "smilesinc_adv", // approved template
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: "Adidas",
                  },
                ],
              },
            ],
          },
        }),
      },
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

async function sendTextMessage(to: string) {
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
          recipient_type: "individual",
          type: "text",
          text: {
            preview_url: false,
            body: `Here’s the full flow 👇
1 - You share the guest list (Name + Mobile) 
2 - We push the invite message on WhatsApp 📩
3 - The attendee taps the button confirming that they are interested to attend 👆
4 - They instantly receive their personal QR code for entry ✅

Along with the QR, we can include a personalized message like: date, time, dress code, location, Google Maps...📍


If you want to try it on an upcoming event, message me directly — Ahmad Shokry | 01227161213 — not this bot. 🙌

*Meta note: We use a generic approved sender name. A fully branded sender name (brand-specific) needs Meta approval paperwork and can take time; until approved, we stick to the generic name.

🚫 This service is available for non-alcohol and non-tobacco/IQOS events only ✅
`,
          },
        }),
      },
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
