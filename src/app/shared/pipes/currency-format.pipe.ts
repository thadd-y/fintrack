import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'finCurrency', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  }
}