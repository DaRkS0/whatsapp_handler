const GRAPH_URL = "https://graph.facebook.com/v24.0";

const { defineSecret } = require('firebase-functions/params');
const WABA_ID = defineSecret('WABA_ID');
const WEBHOOK_VERIFY_TOKEN = defineSecret('WEBHOOK_VERIFY_TOKEN');
const WHATSAPP_TOKEN = defineSecret('WHATSAPP_TOKEN');


export async function sendTemplate({
  to,
  templateName,
  params = [],
  language = "en",
}) {
  const bodyParams = params.map((p) => ({
    type: "text",
    text: p,
  }));

  const res = await fetch(
    `${GRAPH_URL}/901825669687890/messages`,
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
          name: templateName,
          language: { code: language },
          components: bodyParams.length
            ? [{ type: "body", parameters: bodyParams }]
            : [],
        },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
