import { execSync, exec } from 'child_process'
import fs from 'fs'
import path from 'path'

main()

function main() {
  const mode = get_mode()
  init_database_file()
  install_extensions()
  install_deps()
  run_sigmatokens(mode)
}

function get_mode() {
  const mode = process.argv[2]
  return mode.includes('dev')
    ? 'dev'
    : mode.includes('prod')
      ? 'prod'
      : (console.error(
          '[-] Please specify a mode to run the project: dev or prod'
        ),
        process.exit(-1))
}

function init_database_file() {
  const database_dir = path.join(process.cwd(), 'database')
  const database_file_name = 'database.sqlite'
  const database_path = path.join(database_dir, database_file_name)

  if (!fs.existsSync(database_path)) fs.writeFileSync(database_path, '')

  console.log(`[+] Database absolute path: ${database_path}`)
}

function is_extension_installed(extension) {
  const listCommand = 'code --list-extensions'
  const installedExtensions = execSync(listCommand).toString().split('\n')
  return installedExtensions.includes(extension)
}

function is_extension_updated(extension) {
  return new Promise((resolve) => {
    exec(
      `code --list-extensions --show-versions | grep ${extension}`,
      (error, stdout) => {
        resolve(stdout.includes('@') ? stdout.trim() : null)
      }
    )
  })
}

function install_extension(extension) {
  try {
    console.log(`[+] Checking extension: ${extension}`)

    if (is_extension_installed(extension)) {
      is_extension_updated(extension).then((updateCheck) => {
        if (updateCheck) {
          console.log(`[+] ${extension} update available, upgrading...`)
          execSync(`code --install-extension ${extension} --force`)
        } else {
          console.log(`[+] ${extension} is up-to-date`)
        }
      })
    } else {
      console.log(`[+] Installing ${extension}...`)
      execSync(`code --install-extension ${extension} --force`)
    }
  } catch (error) {
    console.error(`[-] Failed: ${error.message}`)
    process.exit(1)
  }
}

function install_extensions() {
  const prettier = 'esbenp.prettier-vscode'
  install_extension(prettier)
  console.log('[+] Extension check complete!')
}

function install_deps() {
  try {
    console.log('[+] Updating deps for root~~~')
    execSync('npm install', { stdio: 'inherit' })

    console.log('[+] Updating deps for database~~~')
    execSync('npm install --prefix database', { stdio: 'inherit' })

    console.log('[+] Updating deps for client~~~')
    execSync('npm install --prefix client', { stdio: 'inherit' })

    console.log('[+] Updating deps for server~~~')
    execSync('npm install --prefix server', { stdio: 'inherit' })

    console.log('[+] Deps update complete!')
  } catch (error) {
    console.error('[-] Failed to update deps:', error.message)
    process.exit(-1)
  }
}

function run_sigmatokens(mode) {
  try {
    console.log(`[+] Starting in ${mode} mode~~~`)
    execSync(`npm run ${mode}`, { stdio: 'inherit' })
  } catch (error) {
    console.error('[-] Failed to start:', error.message)
    process.exit(-1)
  }
}
