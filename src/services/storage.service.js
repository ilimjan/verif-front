class StorageService {
  getUser() {
    let localStorageKeyPart = 'oidc.user';
    let values = Object.keys(localStorage)
      .filter(key => key.match(localStorageKeyPart))
      .map(key => localStorage[key]);
    return values[0];
  }

  getRole() {
    return this.getUser().role;
  }
}

export const $StorageService = new StorageService();
