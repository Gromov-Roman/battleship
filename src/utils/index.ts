export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createEmptyBoard(): ('empty' | 'ship' | 'hit' | 'miss')[][] {
    return Array(10).fill(null).map(() => Array(10).fill('empty'));
}

export function createEmptyBooleanBoard(): boolean[][] {
    return Array(10).fill(null).map(() => Array(10).fill(false));
}
