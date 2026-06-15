const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
function windLabel(speed) {
    return `${Math.round(speed ?? 0)} м/с`;
}
function tempLabel(value) {
    const rounded = Math.round(value ?? 0);
    return rounded > 0 ? `+${rounded}°C` : `${rounded}°C`;
}
function weatherCodeLabel(code) {
    if (code === 0)
        return 'Ясно';
    if (code <= 3)
        return 'Переменная облачность';
    if (code <= 48)
        return 'Туман';
    if (code <= 67)
        return 'Дождь';
    if (code <= 77)
        return 'Снег';
    if (code <= 82)
        return 'Ливень';
    return 'Гроза';
}
function num(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function resolveTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow';
    }
    catch {
        return 'Europe/Moscow';
    }
}
async function fetchWithTimeout(url, init, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' });
    }
    finally {
        window.clearTimeout(timer);
    }
}
function dayLabel(dateStr, index, timezone) {
    if (index === 0)
        return 'Сегодня';
    if (index === 1)
        return 'Завтра';
    const date = new Date(`${dateStr}T12:00:00`);
    const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: timezone }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}
async function fetchYandexViaApi(lat, lng, regionName) {
    const url = new URL('/api/weather', window.location.origin);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lng', String(lng));
    url.searchParams.set('name', regionName);
    const response = await fetchWithTimeout(url.toString());
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(String(payload.error ?? `Сервис погоды недоступен (${response.status})`));
    }
    return (await response.json());
}
async function fetchOpenMeteo(lat, lng, regionName) {
    const timezone = resolveTimezone();
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation,cloud_cover,weather_code,is_day');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code');
    url.searchParams.set('timezone', timezone);
    url.searchParams.set('forecast_days', '7');
    url.searchParams.set('wind_speed_unit', 'ms');
    const response = await fetchWithTimeout(url.toString(), { mode: 'cors' });
    if (!response.ok) {
        throw new Error(`Сервис погоды недоступен (${response.status})`);
    }
    const data = await response.json();
    if (data?.error) {
        throw new Error(String(data.reason ?? 'Некорректный ответ API'));
    }
    const current = data.current;
    const daily = data.daily;
    if (!current || !daily?.time?.length) {
        throw new Error('Пустой ответ прогноза');
    }
    const forecast = daily.time.slice(0, 7).map((dateStr, index) => {
        const maxTemp = num(daily.temperature_2m_max[index]);
        const minTemp = num(daily.temperature_2m_min[index]);
        const code = num(daily.weather_code[index]);
        const rainMm = num(daily.precipitation_sum[index]);
        return {
            day: dayLabel(dateStr, index, timezone),
            temp: `${Math.round(maxTemp) > 0 ? '+' : ''}${Math.round(maxTemp)}° / ${Math.round(minTemp)}°`,
            rain: `${rainMm.toFixed(1)} мм`,
            rainMm,
            minTemp,
            maxTemp,
            wind: windLabel(num(daily.wind_speed_10m_max[index])),
            icon: weatherIcon(code)
        };
    });
    const tomorrow = forecast[1];
    const precipitation = num(current.precipitation);
    const updatedAt = new Intl.DateTimeFormat('ru-RU', {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date());
    return {
        temperature: tempLabel(num(current.temperature_2m)),
        humidity: `${Math.round(num(current.relative_humidity_2m))}%`,
        pressure: `${Math.round(num(current.surface_pressure))} гПа`,
        wind: windLabel(num(current.wind_speed_10m)),
        precipitation: `${precipitation.toFixed(1)} мм`,
        cloudiness: weatherCodeLabel(num(current.weather_code)),
        station: `${regionName} · Open-Meteo · ${timezone}`,
        forecast,
        updatedAt,
        currentIcon: weatherIcon(num(current.weather_code)),
        metrics: {
            temperature: num(current.temperature_2m),
            humidity: num(current.relative_humidity_2m),
            pressure: num(current.surface_pressure),
            windSpeed: num(current.wind_speed_10m),
            precipitation,
            tomorrowRain: tomorrow?.rainMm ?? 0,
            weekRain: forecast.reduce((sum, day) => sum + (day.rainMm ?? 0), 0),
            minTempTomorrow: tomorrow?.minTemp ?? num(current.temperature_2m),
            maxTempTomorrow: tomorrow?.maxTemp ?? num(current.temperature_2m)
        }
    };
}
export async function fetchWeather(lat = 55.7, lng = 37.55, regionName = 'Московская область') {
    let lastError = 'Ошибка сети';
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            return await fetchYandexViaApi(lat, lng, regionName);
        }
        catch (error) {
            lastError = error instanceof Error ? error.message : 'Ошибка сети';
            if (attempt < 1) {
                await new Promise((resolve) => window.setTimeout(resolve, 600));
            }
        }
    }
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await fetchOpenMeteo(lat, lng, regionName);
        }
        catch (error) {
            lastError = error instanceof Error ? error.message : 'Ошибка сети';
            if (attempt < 2) {
                await new Promise((resolve) => window.setTimeout(resolve, 900 * (attempt + 1)));
            }
        }
    }
    throw new Error(lastError);
}
export function weatherIcon(code) {
    if (code === 0)
        return 'clear';
    if (code <= 3)
        return 'partly';
    if (code <= 48)
        return 'fog';
    if (code <= 67)
        return 'rain';
    if (code <= 77)
        return 'snow';
    if (code <= 82)
        return 'shower';
    return 'storm';
}
//# sourceMappingURL=weather.js.map