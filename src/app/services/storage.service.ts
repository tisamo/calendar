import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item);
    } catch (e) {
      return item as T;
    }
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, data);
  }
}
