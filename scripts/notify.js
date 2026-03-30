process.chdir(process.env.GITHUB_WORKSPACE);

const fs = require("fs");
const https = require("https");

const FILTERED_FILE = "filtered.json";
const webhookUrl = process.env.WEBHOOK_URL;

console.log("=== Sending Slack notification ===");

// Webhook URL が無い場合は何もしない
if (!webhookUrl) {
  console.log("WEBHOOK_URL が指定されていないため、Slack 通知はスキップします。");
  process.exit(0);
}

// filtered.json を読み込み
let filtered = [];
try {
  filtered = JSON.parse(fs.readFileSync(FILTERED_FILE, "utf8"));
} catch (e) {
  console.error(`Error: ${FILTERED_FILE} が読み込めません。`);
  process.exit(1);
}

// 更新対象が無ければ通知しない
if (filtered.length === 0) {
  console.log("更新対象が無いため、Slack 通知は行いません。");
  process.exit(0);
}

// Slack に送るメッセージを作成
const lines = filtered.map(pkg => {
  return `• *${pkg.name}* → ${pkg.current} → ${pkg.latest}`;
});

const message = {
  text: `更新対象が ${filtered.length} 件あります:\n${lines.join("\n")}`
};

// Slack Webhook に POST
const payload = JSON.stringify(message);

const url = new URL(webhookUrl);

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`Slack status: ${res.statusCode}`);

  let body = "";
  res.on("data", chunk => {
    body += chunk;
  });

  res.on("end", () => {
    if (res.statusCode >= 400) {
      console.error("Slack 通知に失敗しました。");
      console.error("Slack response:", body);
      process.exit(1);
    }

    console.log("Slack 通知が完了しました。");
    process.exit(0);
  });
});

req.setTimeout(10000, () => {
  console.error("Slack 通知がタイムアウトしました。");
  req.destroy();
  process.exit(1);
});


req.on("error", (err) => {
  console.error("Slack 通知エラー:", err);
  process.exit(1);
});

req.write(payload);
req.end();
