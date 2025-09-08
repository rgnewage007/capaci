export function safeSerialize<T>(data: T): T {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data !== 'object') {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => safeSerialize(item)) as unknown as T;
    }

    if (data instanceof Date) {
        return data.toISOString() as unknown as T;
    }

    // Manejar objetos con prototipo null
    if (Object.getPrototypeOf(data) === null) {
        return JSON.parse(JSON.stringify(data));
    }

    const serialized: Record<string, any> = {};

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = (data as any)[key];

            if (value === null || value === undefined) {
                serialized[key] = value;
            } else if (typeof value === 'object') {
                if (value instanceof Date) {
                    serialized[key] = value.toISOString();
                } else if (Array.isArray(value)) {
                    serialized[key] = value.map(item => safeSerialize(item));
                } else if (value && typeof value === 'object') {
                    // Verificar si es un objeto con prototipo null
                    if (Object.getPrototypeOf(value) === null) {
                        serialized[key] = JSON.parse(JSON.stringify(value));
                    } else {
                        serialized[key] = safeSerialize(value);
                    }
                } else {
                    serialized[key] = value;
                }
            } else {
                serialized[key] = value;
            }
        }
    }

    return serialized as T;
}

export function isSerializable(obj: any): boolean {
    if (obj === null || obj === undefined) {
        return true;
    }

    if (typeof obj !== 'object') {
        return true;
    }

    if (obj instanceof Date) {
        return true;
    }

    if (Object.getPrototypeOf(obj) === null) {
        return true;
    }

    if (Array.isArray(obj)) {
        return obj.every(item => isSerializable(item));
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
                if (Object.getPrototypeOf(value) === null) {
                    continue;
                }
                if (!isSerializable(value)) {
                    return false;
                }
            }

            if (typeof key === 'symbol') {
                return false;
            }
        }
    }

    return true;
}