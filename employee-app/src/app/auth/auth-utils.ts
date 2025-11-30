import { camelCase } from 'lodash-es';

export class AuthUtils {
  static toInt(value: string): number {
    return value ? +value : 0;
  }

  static toIntWithDefault(value: string, defaultValue: number): number {
    return value ? +value : defaultValue;
  }

  static toBoolWithDefault(value: string, defaultValue: boolean): boolean {
    if (value) {
      return /true/i.test(value);
    }
    return defaultValue;
  }

  static suffixUrl(value: string, suffix: string): string {
    if (value && suffix) {
      return value.endsWith('/') ? value + suffix : value + '/' + suffix;
    }
    return value;
  }

  static withDefault(value: string, defaultValue: string): string {
    return value || defaultValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => AuthUtils.toCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [camelCase(key)]: AuthUtils.toCamel(obj[key]),
        }),
        {},
      );
    }
    return obj;
  }

  static generateBaseUrl() {
    const url = globalThis.location.href;
    let queryParam = globalThis.location.search;
    queryParam = queryParam.replace('/\\?$/', '');
    const withoutHash = url.replace(globalThis.location.hash, '');
    return withoutHash.replace(queryParam, '');
  }
}
