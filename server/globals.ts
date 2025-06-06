import { Socket } from 'socket.io';

export class Globals {
  public static app: any = null;
  public static server: any = null;
  public static agentSockets: Map<string, Socket> = new Map<string, Socket>();
}
