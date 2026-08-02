const IPINFO_TOKEN = import.meta.env.VITE_IPINFO_API_KEY;

const ipCache = new Map();

/**
 * Fetch IP Geolocation details using IPInfo API
 * @param {string} ip - IP address to lookup
 */
export const lookupIpInfo = async (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return {
      ip: ip || '127.0.0.1',
      city: 'Private Network',
      region: 'Internal Mesh',
      country: 'IN',
      countryName: 'India (Internal Zone)',
      org: 'ZeroShield DMZ Gateway',
      loc: '12.9716,77.5946',
      isPrivate: true
    };
  }

  if (ipCache.has(ip)) {
    return ipCache.get(ip);
  }

  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`);
    if (!response.ok) {
      throw new Error(`IPInfo error ${response.status}`);
    }
    const data = await response.json();
    
    const result = {
      ip: data.ip || ip,
      city: data.city || 'Unknown City',
      region: data.region || 'Unknown Region',
      country: data.country || 'US',
      org: data.org || 'ISP Provider',
      loc: data.loc || '0,0',
      postal: data.postal || '',
      timezone: data.timezone || 'UTC',
      isPrivate: false
    };

    ipCache.set(ip, result);
    return result;
  } catch (err) {
    console.warn('IPInfo lookup fallback for', ip, err);
    return {
      ip,
      city: 'Resolved Node',
      region: 'Security Cloud',
      country: 'US',
      org: 'External Transit Provider',
      loc: '37.7749,-122.4194',
      isPrivate: false
    };
  }
};
