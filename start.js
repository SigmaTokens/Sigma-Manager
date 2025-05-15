import { fileURLToPath } from 'url';
import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Constants } from './server/constants.js';

main();

function main() {
  if (!isAdmin()) {
    console.error(Constants.TEXT_RED_COLOR, 'Error: must run as admin!',Constants.TEXT_WHITE_COLOR);
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
      : (console.error(Constants.TEXT_RED_COLOR,'Please specify a mode to run the project: dev or prod',Constants.TEXT_WHITE_COLOR), process.exit(-1));
}

function init_database_file() {
  const database_dir = path.join(process.cwd(), 'server/database');
  const database_file_name = 'database.sqlite';
  const database_path = path.join(database_dir, database_file_name);

  if (!fs.existsSync(database_path)) fs.writeFileSync(database_path, '');

  console.log(Constants.TEXT_GREEN_COLOR,`Initiated database: ${database_path}`,Constants.TEXT_WHITE_COLOR);
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
    exec(`code --list-extensions --show-versions | grep ${extension}`, (error, stdout) => {
      resolve(stdout.includes('@') ? stdout.trim() : null);
    });
  });
}

function install_extension(extension) {
  try {
    console.log(Constants.TEXT_YELLOW_COLOR,`Checking extension: ${extension}`,Constants.TEXT_WHITE_COLOR);

    if (is_extension_installed(extension)) {
      is_extension_updated(extension).then((updateCheck) => {
        if (updateCheck) {
          console.log(Constants.TEXT_CYAN_COLOR,`${extension} update available, upgrading...`,Constants.TEXT_WHITE_COLOR);
          execSync(`code --install-extension ${extension} --force`);
        } 
      });
    } else {
      console.log(Constants.TEXT_CYAN_COLOR,`Installing ${extension}...`,Constants.TEXT_WHITE_COLOR);
      execSync(`code --install-extension ${extension} --force`);
    }
  } catch (error) {
    console.error(Constants.TEXT_RED_COLOR,`Failed: ${error.message}`,Constants.TEXT_WHITE_COLOR);
    process.exit(1);
  }
}

function install_extensions() {
  const prettier = 'esbenp.prettier-vscode';
  install_extension(prettier);
}

function create_file(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(Constants.TEXT_GREEN_COLOR,`Created: ${filePath}`,Constants.TEXT_WHITE_COLOR);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(Constants.TEXT_GREEN_COLOR,`Updated: ${filePath}`,Constants.TEXT_WHITE_COLOR);
  }
}

function setup_prettier_config(rootDir) {
  const prettierConfig = `{
    "singleQuote": true,
    "trailingComma": "all",
    "tabWidth": 2,
    "semi": true,
    "plugins": ["prettier-plugin-embed", "prettier-plugin-sql"],
    "embeddedSqlTags": ["sql"],
    "language": "sqlite",
    "keywordCase": "upper",
    "printWidth": 120
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
    console.log(Constants.TEXT_YELLOW_COLOR,'Updating deps for root',Constants.TEXT_WHITE_COLOR);
    execSync('npm install --silent ', { stdio: 'inherit' });

    console.log(Constants.TEXT_YELLOW_COLOR,'Updating deps for client',Constants.TEXT_WHITE_COLOR);
    execSync('npm install --silent  --prefix client', { stdio: 'inherit' });

    console.log(Constants.TEXT_YELLOW_COLOR,'Updating deps for server',Constants.TEXT_WHITE_COLOR);
    execSync('npm install --silent --prefix server', { stdio: 'inherit' });

    console.log(Constants.TEXT_GREEN_COLOR,'Deps update complete',Constants.TEXT_WHITE_COLOR);
  } catch (error) {
    console.error(Constants.TEXT_RED_COLOR,'Failed to update deps:', error.message,Constants.TEXT_WHITE_COLOR);
    process.exit(-1);
  }
}

function run_sigmatokens(mode) {
  try {
    console.log(Constants.TEXT_MAGENTA_COLOR,`Starting in ${mode} mode`,Constants.TEXT_WHITE_COLOR);
    execSync(`npm run ${mode}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(Constants.TEXT_RED_COLOR ,'Failed to start:', error.message);
    process.exit(-1);
  }
}
