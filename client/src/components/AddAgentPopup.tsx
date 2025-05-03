import { useEffect, useState } from 'react';
import { Card } from './popup'; // Assuming Card component is in ./popup.tsx or .js
import { getServerAddress } from '../models/General'; // Assuming getServerAddress is in ../models/General.ts or .js
import '../styles/AddAgentPopup.css'; // Assuming CSS file is in ../styles/AddAgentPopup.css
import { useAsyncError } from 'react-router-dom'; // This import seems unused in the provided code, consider removing if not needed
import { FaClipboard } from 'react-icons/fa'; // Assuming react-icons/fa is installed

interface AddAgentPopupProps {
  onClose: () => void;
}

interface ServerAddress {
  ip: string;
  port: number;
}

/**
 * Generates the appropriate connection script based on the selected OS.
 * @param os The selected operating system ('Windows', 'Linux', 'MacOS').
 * @param manager_ip The IP address of the server.
 * @param manager_port The port of the server.
 * @param agentName The desired name for the agent.
 * @returns The connection script as a string.
 */
function generateScript(
  os: string,
  manager_ip: string | undefined,
  manager_port: number | undefined,
  agentName: string,
): string {
  // Define the base repository URL - ensure this is correct for your agent
  const AGENT_REPO_URL = 'https://github.com/SigmaTokens/Sigma-Manager.git';
  // Define the directory name for the agent software
  const AGENT_DIR = 'agent-software';
  // !!! IMPORTANT !!!
  // Define the actual command to run your agent after installation.
  // You need to find this command in the Sigma-Manager repository's documentation (e.g., README.md).
  // This example assumes the agent is run with node and takes server address and name as arguments.
  // Adjust this command based on how your agent is started and if it needs the server address and name as arguments.
  const AGENT_RUN_COMMAND = `node dist/index.js --server ${manager_ip}:${manager_port} --name ${agentName || 'NEW AGENT'}`; // <<< YOU MIGHT NEED TO UPDATE THIS LINE

  switch (os) {
    case 'Windows':
      return `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

git clone https://github.com/SigmaTokens/Sigma-Agent.git

Set-Location Sigma-Agent

git pull
git checkout daniel001

@"
MANAGER_IP=${manager_ip}
MANAGER_PORT=${manager_port}
AGENT_NAME=${agentName ? agentName : 'NEW AGENT'}
"@ | Out-File .env -Encoding utf8

npm run start-prod`;

    case 'Linux':
      return `git clone https://github.com/SigmaTokens/Sigma-Agent.git && \\
cd Sigma-Agent && \\
printf "MANAGER_IP=${manager_ip}\\nMANAGER_PORT=${manager_port}\\nAGENT_NAME=${agentName || 'NEW AGENT'}\\n" | tee .env > /dev/null && \\
npm run start-prod-linux`;

    case 'MacOS':
      // macOS script based on the previous bash script, with '!' escaped for zsh compatibility
      // The shebang line #!/bin/bash is standard and should be interpreted by the terminal,
      // but escaping the '!' within commands is necessary for zsh.
      return `#!/bin/bash

# This script connects an agent to the specified server on macOS. - by shaked



# --- Configuration ---
SERVER_ADDRESS="10.100.102.3:3000" # Use the dynamic server address
AGENT_REPO_URL="https://github.com/SigmaTokens/Sigma-Manager.git"
AGENT_DIR="agent-software"
AGENT_RUN_COMMAND="node dist/index.js --server 10.100.102.3:3000 --name NEW AGENT" # Use the defined run command

# --- Script Execution ---

echo "Starting agent connection process for macOS..."

# Check if Git is installed (escaped '!' for zsh compatibility)
if \! command -v git &> /dev/null
then
    echo "Error: Git is not installed. Please install Git and try again."
    exit 1
fi

# Check if Node.js is installed (escaped '!' for zsh compatibility)
if \! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if the agent directory already exists
if [ -d "$AGENT_DIR" ]; then
    echo "Agent directory '$AGENT_DIR' already exists. Skipping clone."
    cd "$AGENT_DIR" || { echo "Error: Could not change directory to '$AGENT_DIR'."; exit 1; }
    echo "Pulling latest changes..."
    git pull
else
    echo "Cloning agent repository from $AGENT_REPO_URL..."
    git clone "$AGENT_REPO_URL" "$AGENT_DIR" || { echo "Error: Could not clone repository."; exit 1; }
    cd "$AGENT_DIR" || { echo "Error: Could not change directory to '$AGENT_DIR'."; exit 1; }
fi

echo "Installing dependencies..."
# Assuming package.json exists and uses npm. Use yarn or pnpm if needed.
npm install || { echo "Error: Could not install dependencies."; exit 1; }

echo "Running agent and connecting to $SERVER_ADDRESS..."
# Execute the command to run the agent.
# This command is defined in the Configuration section above.
eval "$AGENT_RUN_COMMAND"

echo "Agent script finished."

# --- Workaround Instructions (if pasting directly fails in zsh) ---
# If you encounter a "zsh: event not found: /bin/bash" error when pasting directly,
# you can try saving the script to a file and running it:
# 1. Copy the entire script content.
# 2. Open a text editor and paste the script.
# 3. Save the file with a .sh extension (e.g., connect_agent.sh).
# 4. Open Terminal and navigate to the directory where you saved the file using 'cd'.
# 5. Make the script executable: chmod +x connect_agent.sh
# 6. Run the script: ./connect_agent.sh

`;
    default:
      return 'os not supported yet';
  }
}

/**
 * Provides OS-specific instructions for opening the terminal and changing directory.
 * @param os The selected operating system ('Windows', 'Linux', 'MacOS').
 * @returns The instruction string.
 */
function getOsInstructions(os: string): string {
  switch (os) {
    case 'Windows':
      return `Please open powershell as administrator and change desired install directory using 'cd'`;
    case 'Linux':
      return `Please open your terminal and change to the desired install directory using 'cd'.`;
    case 'MacOS':
      return `Please open Terminal (Applications → Utilities → Terminal) and change to the desired install directory using 'cd'.`;
    default:
      return 'os not supported yet';
  }
}

/**
 * Copies the provided script text to the user's clipboard and shows a toast notification.
 * @param script The script text to copy.
 * @param setShowToast State setter to control the visibility of the toast notification.
 */
function copyToClipboard(script: string, setShowToast: any) {
  navigator.clipboard.writeText(script).then(() => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 1000); // Hide toast after 1 second
  });
}

/**
 * React component for the Add Agent Popup.
 * Displays instructions and a script for connecting an agent based on OS selection.
 * @param onClose Function to call when the popup should be closed.
 */
export default function AddAgentPopup({ onClose }: AddAgentPopupProps) {
  // State to track the selected operating system
  const [os, setOs] = useState<'Windows' | 'Linux' | 'MacOS'>('Windows');
  // State to store the server address fetched from the backend
  const [serverAddress, setServerAddress] = useState<ServerAddress>();
  // State to store the agent name entered by the user
  const [agentName, setAgentName] = useState<string>('');
  // State to store the generated script
  const [script, setScript] = useState<string>('');
  // State to control the visibility of the "Copied!" toast notification
  const [showToast, setShowToast] = useState(false);

  // Effect to fetch the server address when the component mounts
  useEffect(() => {
    getServerAddress().then((address) => {
      setServerAddress(address);
    });
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to regenerate the script whenever the OS, agent name, or server address changes
  useEffect(() => {
    const newScript = generateScript(
      os,
      serverAddress?.ip,
      serverAddress?.port,
      agentName,
    );
    setScript(newScript);
  }, [os, agentName, serverAddress]); // Dependencies: os, agentName, serverAddress

  return (
    // Overlay to cover the background and close the popup when clicked outside
    <div className="overlay" onClick={onClose}>
      {/* Popup card container, stops propagation to prevent closing when clicking inside */}
      <div className="popup-card-agent" onClick={(e) => e.stopPropagation()}>
        {/* Card component for styling the popup content */}
        <Card>
          <h2 className="popup-title">Add Agent</h2>
          {/* Tabs for selecting the operating system */}
          <div className="tabs">
            {['Windows', 'Linux', 'MacOS'].map((tab) => (
              <span
                key={tab}
                className={`tab ${os === tab ? 'active' : ''}`}
                onClick={() => setOs(tab as typeof os)}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* Instructions for the user */}
          <div className="instruction0">
            To connect a new/existing agent to server: {serverAddress?.ip}:
            {serverAddress?.port} please follow the next steps:
          </div>
          <br />
          <div className="instruction1">
            1. Please name the new agent:
            <input
              id="agentName"
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
              className="agent-input"
            />
          </div>
          <br />
          <div className="instruction2">
            2. Make sure latest{' '}
            <a href="https://nodejs.org/en/download">node.js</a> and{' '}
            <a href="https://git-scm.com/downloads">git</a> versions installed
            on your system.
          </div>
          <br />
          <div className="instruction3">3. {getOsInstructions(os)}</div>

          {/* Section to display the generated script */}
          <div className="script-section">
            <p>
              4. Run the next script (copy and paste it to the powershell cmd):
            </p>
            <div className="script-with-button">
              {/* Textarea to display the script, read-only */}
              <textarea className="script-box" readOnly value={script} />
              {/* Toast notification for copy confirmation */}
              {showToast && <div className="toast">Copied!</div>}
              {/* Clipboard icon to trigger copying the script */}
              <FaClipboard
                className="copy-icon"
                onClick={() => {
                  copyToClipboard(script, setShowToast);
                }}
              />
            </div>
          </div>
          <br />
          <div className="instruction5">
            5. Go to Agents page and confirm the new agent there
          </div>

          {/* Container for action buttons */}
          <div className="button-container">
            {/* Close button */}
            <button className="button button-outline" onClick={onClose}>
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
