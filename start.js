import { execSync } from "child_process";
import fs from "fs";
import path from "path";

main();

function main() {
  const mode = get_mode();
  init_database_file();
  install_deps();
  run_sigmatokens(mode);
}

function get_mode() {
  const mode = process.argv[2];
  return mode.includes("dev")
    ? "dev"
    : mode.includes("prod")
    ? "prod"
    : (console.error(
        "[-] Please specify a mode to run the project: dev or prod"
      ),
      process.exit(-1));
}

function init_database_file() {
  const database_dir = path.join(process.cwd(), "database");
  const database_file_name = "database.sqlite";
  const database_path = path.join(database_dir, database_file_name);

  if (!fs.existsSync(database_path)) fs.writeFileSync(database_path, "");

  console.log(`[+] Database absolute path: ${database_path}`);
}

function install_deps() {
  try {
    console.log("[+] Updating deps for root~~~");
    execSync("npm install", { stdio: "inherit" });

    console.log("[+] Updating deps for database~~~");
    execSync("npm install --prefix database", { stdio: "inherit" });

    console.log("[+] Updating deps for client~~~");
    execSync("npm install --prefix client", { stdio: "inherit" });

    console.log("[+] Updating deps for server~~~");
    execSync("npm install --prefix server", { stdio: "inherit" });

    console.log("[+] Deps update complete!");
  } catch (error) {
    console.error("[-] Failed to update deps:", error.message);
    process.exit(-1);
  }
}

function run_sigmatokens(mode) {
  try {
    console.log(`[+] Starting in ${mode} mode~~~`);
    execSync(`npm run ${mode}`, { stdio: "inherit" });
  } catch (error) {
    console.error("[-] Failed to start:", error.message);
    process.exit(-1);
  }
}
