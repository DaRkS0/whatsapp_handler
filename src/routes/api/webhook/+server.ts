import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  WEBHOOK_VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
} from "$env/static/private";
import { GetDoc, UpdateDoc } from "$lib/firebase/database/client";
import QRCode from "qrcode";
import { serverTimestamp } from "firebase/firestore";

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
  const contacts = value?.contacts || [];


  const statuses = value.statuses || [];





  for (const status of statuses) {
    const recipientId = status.recipient_id;        // phone number
    const messageId = status.id;                    // wamid, links back to the original template send
    const statusType = status.status;                // "sent" | "delivered" | "read" | "failed"
    //const statusTimeUTC = new Date(Number(status.timestamp) * 1000).toISOString();
    const isTemplateOriginated = ['marketing', 'utility', 'authentication']
      .includes(status.pricing?.category); // outgoing status

    if (statusType === "delivered" && isTemplateOriginated) {
      // Handle the delivered status for template-originated messages
      // console.log(`Template message with ID ${messageId} was delivered to ${recipientId} at ${statusTimeUTC}.`);
      // e.g. update your Firestore doc for this recipient/message
      await UpdateDoc("Jadeer", recipientId, {
        deliveredAt: serverTimestamp(),
      });
    }

     if (statusType === "sent" && isTemplateOriginated) {
      // Handle the delivered status for template-originated messages
      // console.log(`Template message with ID ${messageId} was delivered to ${recipientId} at ${statusTimeUTC}.`);
      // e.g. update your Firestore doc for this recipient/message
      await UpdateDoc("Jadeer", recipientId, {
        sentAt: serverTimestamp(),
      });
    }
    // e.g. update your Firestore doc for this recipient/message
  }

  if (!message) {
    return json({ ok: true });
  }
  if (["button"].includes(message.type)) {
    const from = message.from; // wa_id (phone without +)
    const contact = contacts.find((c) => c.wa_id === from) || contacts[0];
    const name = contact?.profile?.name || "";
    const button = message.button?.payload;
    console.log({ button });
    // if (button === "Tell me how it works") {
    //   await sendTextMessage(from);
    //   await sendImageMessage(
    //     from,
    //     "https://fra1.digitaloceanspaces.com/ekaterra-test/Vodafone-Summer-2025/smiles.png",
    //   );

    //   return json({ success: true });
    // }
    if (button === "تأكيد") {
      const TEST = await QRCode.toDataURL(from);
      await sendTextMessage(from);
      // await sendImageMessage(from, TEST);
      await sendImageMessageAlt(from, TEST);
      await UpdateDoc("Jadeer", from, {
        confirmed: true,
        lastUpdated: serverTimestamp(),
        confirmedAt: serverTimestamp(),
        name
      });
      return json({ success: true });
    }
    // if (button === "Get My Photo") {
    //   const uuser = await GetDoc("adidas", from);

    //   if (uuser.exists()) {
    //     const mg = uuser.get("img_status");
    //     const url = uuser.get("url");

    //     if (mg === "complete") {
    //       await sendImageMessage(from, url);
    //     } else {
    //       await UpdateDoc("adidas", from, {
    //         user_status: "waiting",
    //         img_status: "pending",
    //       });
    //     }
    //   }

    //   return json({ success: true });
    // }
  }

  // Only respond to user messages (text, image, etc.)
  if (!["text", "image", "audio", "video", "document"].includes(message.type)) {
    return json({ ok: true });
  }

  const from = message.from; // wa_id (phone without +)

  const text = message.text?.body?.toLowerCase();
  const button = message.button?.payload;

  // await sendTemplateMessage(from);
  const TEST = await QRCode.toDataURL(from);

  await sendTextMessage(from);
  // await sendImageMessage(from, TEST);
  await sendImageMessageAlt(from, TEST);

  await UpdateDoc("Jadeer", from, {
    confirmed: true,
    lastUpdated: serverTimestamp()

  });
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

async function sendImageMessageAlt(to: string, imageSource: string) {
  try {
    // 1. Convert image source to Blob
    let blob: Blob;

    if (imageSource.startsWith("data:image")) {
      const [metadata, base64] = imageSource.split(",");

      const mime = metadata.match(/data:(.*?);base64/)?.[1] || "image/png";

      const buffer = Buffer.from(base64, "base64");

      blob = new Blob([buffer], { type: mime });
    } else {
      const imageRes = await fetch(imageSource);

      if (!imageRes.ok) {
        throw new Error("Failed to download image");
      }

      blob = await imageRes.blob();
    }

    // 2. Upload media to WhatsApp
    const formData = new FormData();

    formData.append("messaging_product", "whatsapp");
    formData.append("file", blob, "image.png");
    formData.append("type", blob.type);

    const uploadRes = await fetch(
      `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
        body: formData,
      },
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("Media upload error:", uploadData);
      return;
    }

    const mediaId = uploadData.id;

    // 3. Send image using media ID
    const sendRes = await fetch(
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
            id: mediaId,
          },
        }),
      },
    );

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      console.error("Error sending image:", sendData);
      return;
    }

    console.log("Image sent:", sendData);
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
                    text: "Client Name Here!!",
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
            body: ` 
            شكرا لإختيارك شركة JADEER
برجاء الاحتفاظ بالQR code لأمكانية الدخول لفعليات تسكين مشروع Chapters
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
