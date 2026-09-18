export class AuthUtils {
  private static readonly CALLBACK_PARAMS = ['code', 'state', 'token', 'id_token', 'error'];

  static hasOidcCallbackParams(url: string = globalThis.location.href): boolean {
    return AuthUtils.CALLBACK_PARAMS.some((param) => {
      const regex = new RegExp('[\\?&#]' + param + '=([^&#]*)');
      return regex.test(url);
    });
  }

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
