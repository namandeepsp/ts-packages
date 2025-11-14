// Number prototype extensions
export function extendNumber() {
  Number.prototype.toPercent = function(decimals: number = 2): string {
    return (this.valueOf() * 100).toFixed(decimals) + '%';
  };

  Number.prototype.toCurrency = function(currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.valueOf());
  };

  Number.prototype.clamp = function(min: number, max: number): number {
    return Math.min(Math.max(this.valueOf(), min), max);
  };

  Number.prototype.isEven = function(): boolean {
    return this.valueOf() % 2 === 0;
  };

  Number.prototype.isOdd = function(): boolean {
    return this.valueOf() % 2 !== 0;
  };

  Number.prototype.isPrime = function(): boolean {
    const num = this.valueOf();
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  Number.prototype.factorial = function(): number {
    const num = Math.floor(this.valueOf());
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  Number.prototype.toOrdinal = function(): string {
    const num = Math.floor(this.valueOf());
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  Number.prototype.toRoman = function(): string {
    const num = Math.floor(this.valueOf());
    if (num <= 0 || num >= 4000) return num.toString();
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    let n = num;
    for (let i = 0; i < values.length; i++) {
      while (n >= values[i]) {
        result += symbols[i];
        n -= values[i];
      }
    }
    return result;
  };

  Number.prototype.inRange = function(min: number, max: number): boolean {
    const num = this.valueOf();
    return num >= min && num <= max;
  };
}