// String prototype extensions
export function extendString() {
  String.prototype.toCapitalize = function(): string {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
  };

  String.prototype.toCamelCase = function(): string {
    return this.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  };

  String.prototype.toKebabCase = function(): string {
    return this.replace(/([a-z])([A-Z])/g, '$1-$2')
               .replace(/[\s_]+/g, '-')
               .toLowerCase();
  };

  String.prototype.toSnakeCase = function(): string {
    return this.replace(/([a-z])([A-Z])/g, '$1_$2')
               .replace(/[\s-]+/g, '_')
               .toLowerCase();
  };

  String.prototype.truncate = function(length: number, suffix: string = '...'): string {
    return this.length > length ? this.substring(0, length) + suffix : this.toString();
  };

  String.prototype.isEmail = function(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.toString());
  };

  String.prototype.isUrl = function(): boolean {
    try {
      new URL(this.toString());
      return true;
    } catch {
      return false;
    }
  };

  String.prototype.removeWhitespace = function(): string {
    return this.replace(/\s+/g, '');
  };

  String.prototype.reverse = function(): string {
    return this.split('').reverse().join('');
  };

  String.prototype.isPalindrome = function(): boolean {
    const cleaned = this.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  };

  String.prototype.toTitleCase = function(): string {
    return this.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  String.prototype.stripHtml = function(): string {
    return this.replace(/<[^>]*>/g, '');
  };

  String.prototype.padStart = function(targetLength: number, padString: string = ' '): string {
    return this.toString().padStart(targetLength, padString);
  };

  String.prototype.padEnd = function(targetLength: number, padString: string = ' '): string {
    return this.toString().padEnd(targetLength, padString);
  };

  String.prototype.count = function(substring: string): number {
    return (this.match(new RegExp(substring, 'g')) || []).length;
  };

  String.prototype.words = function(): string[] {
    return this.trim().split(/\s+/).filter(word => word.length > 0);
  };

  String.prototype.lines = function(): string[] {
    return this.split(/\r?\n/);
  };
}