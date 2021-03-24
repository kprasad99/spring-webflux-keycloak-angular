
export class AuthUtils {

    static toInt(value: string): number {
        return value ? +value : 0;
    }

    static toIntWithDefault(value: string, defaultValue: number): number {
        return value ? +defaultValue : 0;
    }

    static toBoolWithDefault(value: string, defaultValue: boolean): boolean {
        if (value) {
            return (/true/i).test(value);
        }
        return defaultValue;
    }

    static suffixUrl(value: string, suffix: string): string {
        if (value && suffix) {
            if (value.endsWith("/")) {
                return value + suffix;
            } else {
                return value + "/" + suffix;
            }
        }
        return value;
    }

    static withDefault(value: string, defaultValue: string) {
        return value ? value : defaultValue;
    }

}