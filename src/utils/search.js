const LATIN_TO_CYRILLIC = {
    a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'дж', k: 'к',
    l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в',
    w: 'в', x: 'кс', y: 'ы', z: 'з'
};
export function normalizeSearchText(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/ё/g, 'е')
        .replace(/\s+/g, ' ');
}
export function transliterateHint(value) {
    return normalizeSearchText(value)
        .split('')
        .map((char) => LATIN_TO_CYRILLIC[char] ?? char)
        .join('');
}
export function searchScore(text, query) {
    const haystack = normalizeSearchText(text);
    const needle = normalizeSearchText(query);
    const alt = transliterateHint(query);
    if (haystack.startsWith(needle) || haystack.startsWith(alt))
        return 0;
    if (haystack.includes(needle) || haystack.includes(alt))
        return 1;
    return 2;
}
//# sourceMappingURL=search.js.map