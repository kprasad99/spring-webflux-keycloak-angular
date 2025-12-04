export class AuthUtils {
  static suffixUrl(value: string, suffix: string): string {
    if (value && suffix) {
      return value.endsWith('/') ? value + suffix : value + '/' + suffix;
    }
    return value;
  }

  static generateBaseUrl() {
    const url = globalThis.location.href;
    let queryParam = globalThis.location.search;
    queryParam = queryParam.replace('/\\?$/', '');
    const withoutHash = url.replace(globalThis.location.hash, '');
    return withoutHash.replace(queryParam, '');
  }
}
