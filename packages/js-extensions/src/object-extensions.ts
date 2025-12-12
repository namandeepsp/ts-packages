// Object prototype extensions
import { withCache } from './performance';

export function extendObject() {
  Object.prototype.isEmpty = function(): boolean {
    return Object.keys(this).length === 0;
  };

  Object.prototype.pick = function<T extends Record<string, any>, K extends keyof T>(keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    const obj = this as T;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  };

  Object.prototype.omit = function<T extends Record<string, any>, K extends keyof T>(keys: K[]): Omit<T, K> {
    const result = { ...this } as T;
    keys.forEach(key => {
      delete result[key];
    });
    return result as Omit<T, K>;
  };

  Object.prototype.deepClone = function<T>(): T {
    const objStr = JSON.stringify(this);
    return withCache(`clone_${objStr}`, () => {
      if (this === null || typeof this !== 'object') return this;
      if (this instanceof Date) return new Date(this.getTime()) as any;
      if (this instanceof Array) return this.map(item => item?.deepClone?.() || item) as any;
      
      const cloned = {} as T;
      Object.keys(this).forEach(key => {
        const value = (this as any)[key];
        (cloned as any)[key] = value?.deepClone?.() || value;
      });
      return cloned;
    });
  };

  Object.prototype.merge = function(other: Record<string, any>): Record<string, any> {
    return { ...this, ...other };
  };

  Object.prototype.deepFreeze = function<T>(): T {
    const propNames = Object.getOwnPropertyNames(this);
    for (const name of propNames) {
      const value = (this as any)[name];
      if (value && typeof value === 'object') {
        value.deepFreeze();
      }
    }
    return Object.freeze(this) as T;
  };

  Object.prototype.hasPath = function(path: string): boolean {
    const keys = path.split('.');
    let current: any = this;
    for (const key of keys) {
      if (current == null || !(key in current)) return false;
      current = current[key];
    }
    return true;
  };

  Object.prototype.getPath = function(path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let current: any = this;
    for (const key of keys) {
      if (current == null || !(key in current)) return defaultValue;
      current = current[key];
    }
    return current;
  };

  Object.prototype.setPath = function(path: string, value: any): any {
    const keys = path.split('.');
    let current: any = this;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return this;
  };
}