const _randomGaussian = () => {
    let u1 = 0,
        u2 = 0;
    //Convert [0,1) to (0,1)
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const R = Math.sqrt(-2.0 * Math.log(u1));
    const Θ = 2.0 * Math.PI * u2;
    return [R * Math.cos(Θ), R * Math.sin(Θ)];
};

/**
 * Provides a random, normal-distributed value.
 *
 * https://stackoverflow.com/a/49434653
 */
export function randomGaussian(mean: number, stdev: number, skew = 0) {
    const [u0, v] = _randomGaussian();
    if (skew === 0) return mean + stdev * u0;
    const delta = skew / Math.sqrt(1 + skew * skew);
    const u1 = delta * u0 + Math.sqrt(1 - delta * delta) * v;
    const z = u0 >= 0 ? u1 : -u1;
    return mean + stdev * z;
}
