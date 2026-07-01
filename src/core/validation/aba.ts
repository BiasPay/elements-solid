/**
 * Validate a US bank routing number using the ABA checksum algorithm.
 *
 * The routing number is valid if:
 * 1. It contains exactly 9 digits
 * 2. The weighted sum of digits (3-7-1 pattern) is divisible by 10
 */
export function isValidRoutingNumber(routingNumber: string): boolean {
    if (routingNumber.length !== 9 || !/^\d{9}$/.test(routingNumber)) {
        return false;
    }

    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        sum += Number.parseInt(routingNumber[i]!, 10) * weights[i]!;
    }

    return sum !== 0 && sum % 10 === 0;
}
