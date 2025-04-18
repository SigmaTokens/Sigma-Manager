import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';

main();

function main() {
  if (!isAdmin()) {
    console.error('[-] Error: must run as admin!');
    process.exit(-1);
  }
  const mode = get_mode();
  init_database_file();
  const root_dir = get_root_dir();
  setup_prettier_config(root_dir);
  setup_vscode_settings(root_dir);
  install_extensions();
  install_deps();
  run_sigmatokens(mode);
}

function isAdmin() {
  try {
    if (process.platform === 'win32') {
      execSync('net session >nul 2>&1');
      return true;
    } else return process.geteuid && process.geteuid() === 0;
  } catch (e) {
    return false;
  }
}

function get_mode() {
  const mode = process.argv[2];
  return mode.includes('dev')
    ? 'dev'
    : mode.includes('prod')
      ? 'prod'
      : (console.error(
          '[-] Please specify a mode to run the project: dev or prod',
        ),
        process.exit(-1));
}

function init_database_file() {
  const database_dir = path.join(process.cwd(), 'database');
  const database_file_name = 'database.sqlite';
  const database_path = path.join(database_dir, database_file_name);

  if (!fs.existsSync(database_path)) fs.writeFileSync(database_path, '');

  console.log(`[+] Database absolute path: ${database_path}`);
}

function get_root_dir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return __dirname;
}

function is_extension_installed(extension) {
  const listCommand = 'code --list-extensions';
  const installedExtensions = execSync(listCommand).toString().split('\n');
  return installedExtensions.includes(extension);
}

function is_extension_updated(extension) {
  return new Promise((resolve) => {
    exec(
      `code --list-extensions --show-versions | grep ${extension}`,
      (error, stdout) => {
        resolve(stdout.includes('@') ? stdout.trim() : null);
      },
    );
  });
}

function install_extension(extension) {
  try {
    console.log(`[+] Checking extension: ${extension}`);

    if (is_extension_installed(extension)) {
      is_extension_updated(extension).then((updateCheck) => {
        if (updateCheck) {
          console.log(`[+] ${extension} update available, upgrading...`);
          execSync(`code --install-extension ${extension} --force`);
        } else {
          console.log(`[+] ${extension} is up-to-date`);
        }
      });
    } else {
      console.log(`[+] Installing ${extension}...`);
      execSync(`code --install-extension ${extension} --force`);
    }
  } catch (error) {
    console.error(`[-] Failed: ${error.message}`);
    process.exit(1);
  }
}

function install_extensions() {
  const prettier = 'esbenp.prettier-vscode';
  install_extension(prettier);
  console.log('[+] Extension check complete!');
}

function create_file(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Created: ${filePath}`);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[+] Updated: ${filePath}`);
  }
}

function setup_prettier_config(rootDir) {
  const prettierConfig = `{
    "singleQuote": true,
    "trailingComma": "all",
    "tabWidth": 2,
    "semi": true
  }`;

  const prettierIgnore = `node_modules
dist
build
database/*.json
`;

  create_file(path.join(rootDir, '.prettierrc'), prettierConfig);
  create_file(path.join(rootDir, '.prettierignore'), prettierIgnore);
}

function setup_vscode_settings(rootDir) {
  const vscodeDir = path.join(rootDir, '.vscode');
  const settingsFile = path.join(vscodeDir, 'settings.json');

  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  const settings = {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
  };

  create_file(settingsFile, JSON.stringify(settings, null, 2));
}

function install_deps() {
  try {
    console.log('[+] Updating deps for root~~~');
    execSync('npm install', { stdio: 'inherit' });

    console.log('[+] Updating deps for database~~~');
    execSync('npm install --prefix database', { stdio: 'inherit' });

    console.log('[+] Updating deps for client~~~');
    execSync('npm install --prefix client', { stdio: 'inherit' });

    console.log('[+] Updating deps for server~~~');
    execSync('npm install --prefix server', { stdio: 'inherit' });

    console.log('[+] Deps update complete!');
  } catch (error) {
    console.error('[-] Failed to update deps:', error.message);
    process.exit(-1);
  }
}

function run_sigmatokens(mode) {
  try {
    console.log(`[+] Starting in ${mode} mode~~~`);
    execSync(`npm run ${mode}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('[-] Failed to start:', error.message);
    process.exit(-1);
  }
}
