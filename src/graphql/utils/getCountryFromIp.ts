import maxmind, { CountryResponse } from 'maxmind';
import path from 'path';

export async function getCountryFromIp(ip: string): Promise<string | null> {
  // if running on localhost, then the ip is "::1" or "127.0.0.1"
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return null;
  }

  const countryDbPath = path.join(__dirname, 'GeoLite2-Country.mmdb');
  const lookup = await maxmind.open<CountryResponse>(countryDbPath);
  const countryResponse = lookup.get(ip);

  if (countryResponse) {
    return countryResponse?.country?.iso_code || null;
  }

  return null;
}
