import { camelCase } from 'lodash-es';

export class ObjectUtils {
  static withDefault<T>(value: T, defaultValue: T): T {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.toCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce(
        (result, key) => ({
          ...result,
          [camelCase(key)]: this.toCamel(obj[key]),
        }),
        {},
      );
    } else if (typeof obj === 'string') {
      // Convert string "true"/"false" to boolean
      if (obj === 'true') return true;
      if (obj === 'false') return false;

      // Convert numeric strings to numbers
      const num = Number(obj);
      if (!isNaN(num) && obj.trim() !== '') {
        return num;
      }
    }
    return obj;
  }
}
