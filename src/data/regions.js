import { rfSubjects } from './rfSubjects';
import { villages } from './villages';
import { normalizeSearchText, searchScore, transliterateHint } from '@/utils/search';
import { ref } from 'vue';
const baseRegions = [...rfSubjects, ...villages.filter((v) => v.id !== 'yuzhny-proekt')];
let extraSettlements = [];
let settlementsLoaded = false;
let settlementsPromise = null;
/** Reactive tick — подключайте в computed поиска, чтобы обновить подсказки после загрузки JSON */
export const settlementsRevision = ref(0);
export const settlementsLoading = ref(false);
export async function ensureSettlementsLoaded() {
    if (settlementsLoaded)
        return;
    if (!settlementsPromise) {
        settlementsLoading.value = true;
        settlementsPromise = fetch('/data/settlements-ru.json')
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => {
            extraSettlements = Array.isArray(data) ? data : [];
        })
            .catch(() => {
            extraSettlements = [];
        })
            .finally(() => {
            settlementsLoaded = true;
            settlementsLoading.value = false;
            settlementsRevision.value++;
        });
    }
    await settlementsPromise;
}
export function getAllRegions() {
    const demo = villages.find((v) => v.id === 'yuzhny-proekt');
    return demo ? [...baseRegions, ...extraSettlements, demo] : [...baseRegions, ...extraSettlements];
}
export const mapRegions = getAllRegions();
export function getSettlementsCount() {
    return extraSettlements.length;
}
export function getSettlementsStats() {
    return {
        loaded: settlementsLoaded,
        count: extraSettlements.length,
        minPopulation: 1000
    };
}
export function findRegion(id) {
    return (getAllRegions().find((item) => item.id === id) ??
        getAllRegions().find((item) => item.id === 'yuzhny-proekt') ??
        rfSubjects[0]);
}
function normalizeRegionKey(value) {
    return normalizeSearchText(value)
        .replace(/\s*(область|край|республика|автономный округ|ао|округ)\s*$/g, '')
        .trim();
}
function dedupeRegionResults(items) {
    const map = new Map();
    for (const item of items) {
        const regionPart = (item.parent ?? '').split('·')[0]?.trim() ?? '';
        const key = `${normalizeSearchText(item.name)}|${normalizeRegionKey(regionPart)}`;
        const existing = map.get(key);
        if (!existing || (item.population ?? 0) > (existing.population ?? 0)) {
            map.set(key, item);
        }
    }
    return [...map.values()];
}
export function searchRegions(query, limit = 25) {
    const normalized = normalizeSearchText(query);
    if (normalized.length < 2)
        return [];
    const tokens = normalized.split(' ').filter(Boolean);
    const altTokens = transliterateHint(normalized).split(' ').filter(Boolean);
    const pool = getAllRegions();
    const matched = pool.filter((region) => {
        const haystack = normalizeSearchText([region.name, region.type, region.parent ?? '', region.id.replace(/-/g, ' ')].join(' '));
        return tokens.every((token, index) => haystack.includes(token) || haystack.includes(altTokens[index] ?? transliterateHint(token)));
    });
    return dedupeRegionResults(matched)
        .sort((a, b) => {
        const aText = [a.name, a.parent ?? ''].join(' ');
        const bText = [b.name, b.parent ?? ''].join(' ');
        const scoreDiff = searchScore(aText, normalized) - searchScore(bText, normalized);
        if (scoreDiff !== 0)
            return scoreDiff;
        const popDiff = (b.population ?? 0) - (a.population ?? 0);
        if (popDiff !== 0)
            return popDiff;
        const typeRank = (item) => (item.type === 'Село' ? 0 : item.type === 'Город' ? 1 : 2);
        return typeRank(a) - typeRank(b) || a.name.localeCompare(b.name, 'ru');
    })
        .slice(0, limit);
}
//# sourceMappingURL=regions.js.map