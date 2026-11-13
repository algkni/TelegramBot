export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET") {
      return new Response("Telegram bot is running.");
    }

    if (request.method !== "POST" || url.pathname !== "/telegram") {
      return new Response("Not found", { status: 404 });
    }

    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const message = update.message;
    if (message?.text === "/start" || message?.text?.startsWith("/start@")) {
      const apiUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
      const result = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: "."
        })
      });

      if (!result.ok) {
        return new Response("Telegram API error", { status: 502 });
      }
    }

    return new Response("OK");
  }
};
