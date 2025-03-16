import { execSync } from "child_process";

function get_mode() {
  const mode = process.argv[2];
  if (mode.includes("dev")) return "dev";
  else if (mode.includes("prod")) return "prod";

  console.error("[-] Please specify a mode to run the project: dev or prod");
  process.exit(-1);
}

function install_deps() {
  try {
    console.log("[+] Updating deps for root~~~");
    execSync("npm install", { stdio: "inherit" });

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
    console.log(`Starting in ${mode} mode~~~`);
    execSync(`npm run ${mode}`, { stdio: "inherit" });
  } catch (error) {
    console.error("[-] Failed to start:", error.message);
    process.exit(-1);
  }
}

function main() {
  const mode = get_mode();
  install_deps();
  run_sigmatokens(mode);
}

main();
