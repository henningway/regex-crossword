import { take } from 'ramda';

export function randomElement<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
}

export function randomSubset<T>(list: T[], count?: number): T[] {
    count = count ?? Math.random() * list.length;

    return take(Math.ceil(count), shuffle(list));
}

export function repeatFunction<T>(f: () => T, n: number): T[] {
    const result = [];

    for (let i = 0; i < n; i++) {
        result.push(f());
    }

    return result;
}

export function shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest;

    it('can provide an array of the results of running a given function n times', () => {
        const makeFoo = () => 'foo';

        expect(repeatFunction(makeFoo, 3)).toStrictEqual(['foo', 'foo', 'foo']);
    });
}
