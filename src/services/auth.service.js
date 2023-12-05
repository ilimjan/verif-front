import { $StorageService } from './storage.service';

const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'fs_operator',
  ANALYST: 'fs_analyst'
};

class AuthService {
  isAdmin() {
    return $StorageService.getRole() === ROLES.ADMIN;
  }

  isOperator() {
    return $StorageService.getRole() === ROLES.OPERATOR;
  }

  isAnalyst() {
    return $StorageService.getRole() === ROLES.ANALYST;
  }
}

export const $AuthService = new AuthService();
