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

export function generateInstallScript(os: string, manager_host: string, userId: string, agentName?: string): string {
  const manager_host_header = `MANAGER_HOST=${manager_host}`;
  const user_id_header = `USER_ID=${userId}`;
  const agent_name_header = `AGENT_NAME=${agentName || 'NEW AGENT'}`;
  switch (os) {
    case OS.Windows:
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
git clone https://github.com/SigmaTokens/Sigma-Agent.git
Set-Location Sigma-Agent
@"
${manager_host_header}
${user_id_header}
${agent_name_header}
"@ | Out-File .env -Encoding utf8; npm run start-prod`;

    case OS.Linux:
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "${manager_host_header}\n${user_id_header}\n${agent_name_header}\n" | tee .env > /dev/null && \
npm run start-prod-linux`;

    case OS.Mac:
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \
cd Sigma-Agent && \
printf "${manager_host_header}\n${user_id_header}\n${agent_name_header}\n" | tee .env > /dev/null && \
npm run start-prod-mac`;

    default:
      return 'OS not supported yet';
  }
}
