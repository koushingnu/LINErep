import "dotenv/config";
import express from "express";
import { middleware, MiddlewareConfig, WebhookEvent } from "@line/bot-sdk";
import nodemailer from "nodemailer";

const config: MiddlewareConfig & { channelAccessToken: string } = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_ACCESS_TOKEN!,
};

// メール送信用のトランスポーター設定
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const app = express();

// リクエストのログ出力
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// デバッグ用：環境変数の確認
console.log("設定確認:");
console.log(
  "- Channel Secret:",
  process.env.LINE_CHANNEL_SECRET?.substring(0, 5) + "..."
);
console.log(
  "- Channel Secret Length:",
  process.env.LINE_CHANNEL_SECRET?.length
);
console.log(
  "- Access Token:",
  process.env.LINE_ACCESS_TOKEN?.substring(0, 5) + "..."
);
console.log("- Access Token Length:", process.env.LINE_ACCESS_TOKEN?.length);

// Webhook受信（署名検証＋JSONパース）
app.post("/webhook", middleware(config), async (req: any, res) => {
  console.log("Webhook received");
  const events: WebhookEvent[] = req.body.events || [];
  for (const ev of events) {
    await handleEvent(ev); // 保存のみ行う
  }
  res.status(200).end(); // 返信しない（HTTP 200 を即返す）
});

async function handleEvent(event: WebhookEvent) {
  // 例：テキストメッセージのみ抽出
  if (event.type === "message" && event.message.type === "text") {
    const record = {
      line_user_id: event.source.userId || "",
      text: event.message.text,
      timestamp: new Date(event.timestamp).toISOString(),
    };
    console.log("INBOUND:", record);

    // メール送信
    try {
      const toAddresses = process.env.MAIL_TO?.split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .join(",");

      console.log("送信先アドレス:", toAddresses);

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: toAddresses,
        subject: `LINE問い合わせ【フレッツ光でグッドライフ】flets_line`,
        text: `[ID] : ${record.line_user_id}\n[Message] : ${record.text}`,
      });
      console.log("メール送信成功");
    } catch (error) {
      console.error("メール送信エラー:", error);
      if (error instanceof Error) {
        console.error("エラー詳細:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
    }

    // 任意：スプレッドシートへ送信
    const endpoint = process.env.SHEET_ENDPOINT;
    if (endpoint) {
      const { default: fetch } = await import("node-fetch");
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(console.error);
    }
  }
}

// ヘルスチェック用エンドポイント
app.get("/", (_req, res) => res.send("LINE PoC (receive-only) running"));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Listening http://localhost:${port}`));
