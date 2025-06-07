import { networkInterfaces } from 'os';

export function getLocalIPv4s(): string[] {
  const ifaces = networkInterfaces();
  const virtualInterfaceRegex =
    /^(lo|docker|vmnet|veth|br-|tun|utun|vEthernet)/i;

  // 1) Find the “priority” address: first wifi, otherwise first non-virtual
  let priority: string | null = null;
  for (const [name, list] of Object.entries(ifaces)) {
    if (!list) continue;
    if (/wifi/i.test(name)) {
      const wifiAddr = list.find((i) => i.family === 'IPv4' && !i.internal);
      if (wifiAddr) {
        priority = wifiAddr.address;
        break;
      }
    }
  }
  if (!priority) {
    for (const [name, list] of Object.entries(ifaces)) {
      if (!list || virtualInterfaceRegex.test(name)) continue;
      const addr = list.find((i) => i.family === 'IPv4' && !i.internal);
      if (addr) {
        priority = addr.address;
        break;
      }
    }
  }

  // 2) Collect _all_ non-internal IPv4s (from every interface)
  const allAddrs: string[] = [];
  for (const list of Object.values(ifaces)) {
    if (!list) continue;
    for (const i of list) {
      if (i.family === 'IPv4' && !i.internal) {
        allAddrs.push(i.address);
      }
    }
  }

  // 3) De-duplicate and reorder so `priority` is first
  const uniques = Array.from(new Set(allAddrs));
  if (priority) {
    const withoutPri = uniques.filter((ip) => ip !== priority);
    return [priority, ...withoutPri];
  }

  // 4) Fallback: if nothing found, return loopback
  return uniques.length > 0 ? uniques : ['127.0.0.1'];
}
