declare module 'react-datepicker' {
  import React from 'react';
  
  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    locale?: string;
    dateFormat?: string;
    inline?: boolean;
    filterDate?: (date: Date) => boolean;
    [key: string]: any;
  }
  
  const DatePicker: React.FC<ReactDatePickerProps>;
  
  export function registerLocale(localeName: string, localeData: any): void;
  
  export default DatePicker;
} 