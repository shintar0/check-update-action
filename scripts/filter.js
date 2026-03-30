process.chdir(process.env.GITHUB_WORKSPACE);

const fs = require("fs");
const yaml = require("js-yaml");
const minimatch = require("minimatch");

const OUTDATED_FILE = "outdated.json";
const FILTERED_FILE = "filtered.json";

const whitelistPath = process.env.WHITELIST_FILE;
const failOnUpdate = process.env.FAIL_ON_UPDATE === "true";

console.log("=== Filtering outdated packages ===");

// outdated.json を読み込み
let outdated = [];
try {
  outdated = JSON.parse(fs.readFileSync(OUTDATED_FILE, "utf8"));
} catch (e) {
  console.error(`Error: ${OUTDATED_FILE} が読み込めません。`);
  process.exit(1);
}

// whitelist を読み込み
let whitelist = [];
if (whitelistPath && fs.existsSync(whitelistPath)) {
  try {
    const yamlData = yaml.load(fs.readFileSync(whitelistPath, "utf8"));
    whitelist = yamlData?.packages || [];
  } catch (e) {
    console.error(`Error: whitelist ファイル '${whitelistPath}' の読み込みに失敗しました。`);
    process.exit(1);
  }
}

// パッケージが whitelist に該当するか判定
function isWhitelisted(pkgName, latestVersion) {
  for (const rule of whitelist) {
    if (rule.name !== pkgName) continue;

    const pattern = rule.skipped_version;

    // "*" → 全バージョン除外
    if (pattern === "*") return true;

    // minimatch のワイルドカード（例: "4.*.*", "4.1.*"）
    if (minimatch(latestVersion, pattern)) return true;
  }
  return false;
}

// whitelist を適用
const filtered = outdated.filter((pkg) => {
  const pkgName = pkg.name;
  const latest = pkg.latest;

  if (isWhitelisted(pkgName, latest)) {
    console.log(`- Skipped (whitelisted): ${pkgName} → ${latest}`);
    return false;
  }

  return true;
});

// 結果を保存
fs.writeFileSync(FILTERED_FILE, JSON.stringify(filtered, null, 2));
console.log(`=== Filtered result saved to ${FILTERED_FILE} ===`);

// FAIL_ON_UPDATE の処理
if (filtered.length > 0) {
  console.log(`更新対象が ${filtered.length} 件あります。`);

  if (failOnUpdate) {
    console.error("FAIL_ON_UPDATE が true のため、異常終了します。");
    process.exit(1);
  }
} else {
  console.log("更新対象はありません。");
}

console.log("=== Filtering completed ===");
