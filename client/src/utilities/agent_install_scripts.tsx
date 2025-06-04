import { OS } from './typing';

export function getOsInstructions(os: string): string {
  switch (os) {
    case OS.Windows:
      return "Please open PowerShell as admin and change to your agent install directory using 'cd'.";
    case OS.Linux:
      return "Please open Terminal as admin and change to your agent install directory using 'cd'.";
    case OS.Mac:
      return "Please open Terminal as admin and change to your agent install directory using 'cd'.";
    default:
      return 'OS not supported yet.';
  }
}

export function generateUpdateScript(os: string): string {
  switch (os) {
    case OS.Windows:
      return 'git pull; npm run start-prod';
    case OS.Linux:
      return 'git pull && npm run start-prod-linux';
    case OS.Mac:
      return 'git pull && npm run start-prod-mac';
    default:
      return '';
  }
}

export function generateInstallScript(
  os: string,
  manager_ip?: string,
  manager_port?: number,
  agentName?: string,
  manager_domain?: string,
  mode?: 'domain' | 'ip',
): string {
  const header = `AGENT_NAME=${agentName || 'NEW AGENT'}`;
  switch (os) {
    case OS.Windows:
      if (mode == 'domain') {
        return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
git clone https://github.com/SigmaTokens/Sigma-Agent.git
Set-Location Sigma-Agent
@"
MANAGER_DOMAIN=${manager_domain}
${header}
"@ | Out-File .env -Encoding utf8; npm run start-prod`;
      }
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
git clone https://github.com/SigmaTokens/Sigma-Agent.git
Set-Location Sigma-Agent
@"
MANAGER_IP=${manager_ip}
MANAGER_PORT=${manager_port}
${header}
"@ | Out-File .env -Encoding utf8; npm run start-prod`;

    case OS.Linux:
      if (mode == 'domain') {
        return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_DOMAIN=${manager_domain}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-linux`;
      }
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_IP=${manager_ip}\nMANAGER_PORT=${manager_port}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-linux`;

    case OS.Mac:
      if (mode == 'domain') {
        return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_DOMAIN=${manager_domain}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-mac`;
      }
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "MANAGER_IP=${manager_ip}\nMANAGER_PORT=${manager_port}\n${header}\n" | tee .env > /dev/null && \
npm run start-prod-mac`;

    default:
      return 'OS not supported yet';
  }
}
