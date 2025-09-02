// Coordenadas médias de alguns países (expandível)
const countryCoords = {
  "Portugal": { lat: 39.5, lon: -8.0 },
  "Spain": { lat: 40.4, lon: -3.7 },
  "France": { lat: 46.2, lon: 2.2 },
  "Germany": { lat: 51.2, lon: 10.4 },
  "United Kingdom": { lat: 55.3, lon: -3.4 },
  "Brazil": { lat: -14.2, lon: -51.9 },
  "United States": { lat: 39.8, lon: -98.6 }
};

// Normalizar nomes de país
function normalizeCountry(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  if (["united states", "usa", "united states of america"].includes(n)) return "United States";
  if (["uk", "united kingdom", "england", "great britain"].includes(n)) return "United Kingdom";
  if (["czech republic"].includes(n)) return "Czechia";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Fórmula de Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcula ping estimado
function estimatePing(userCountry, serverCountry) {
  const u = countryCoords[normalizeCountry(userCountry)];
  const s = countryCoords[normalizeCountry(serverCountry)];
  if (!u || !s) return null;
  const dist = haversine(u.lat, u.lon, s.lat, s.lon);
  return Math.round(dist / 2 + 20);
}

// Buscar país do usuário
async function getUserCountry() {
  try {
    const r = await fetch("https://ip-api.com/json/");
    const data = await r.json();
    return data.country || null;
  } catch (e) {
    console.error("Erro ao buscar país do usuário:", e);
    return null;
  }
}

// Buscar país do servidor
async function getServerCountry(ip) {
  try {
    const r = await fetch("https://ip-api.com/json/" + ip);
    const data = await r.json();
    return data.country || null;
  } catch (e) {
    console.error("Erro ao buscar país do servidor:", e);
    return null;
  }
}

// Função principal
async function calcularPingEstimado(ipDoServidor) {
  const userCountry = await getUserCountry();
  const serverCountry = await getServerCountry(ipDoServidor);

  if (userCountry && serverCountry) {
    const ping = estimatePing(userCountry, serverCountry);
    return {
      userCountry,
      serverCountry,
      ping
    };
  } else {
    return { ping: null };
  }
}
