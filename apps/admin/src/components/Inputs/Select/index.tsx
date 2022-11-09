import React, { useEffect } from 'react';

interface SelectProps {
  title: string;
  options: string[];
  value: string;
  setValue: React.Dispatch<React.SetStateAction<any>>;
  inputProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  dep?: any;
}

const Select = ({
  title,
  setValue,
  value,
  options,
  inputProps,
  dep,
}: SelectProps) => {
  useEffect(() => {
    if (dep) {
      setValue('');
    }
  }, [dep]);

  return (
    <div className='flex w-full flex-col text-sm lg:flex-row lg:items-center lg:space-x-3 lg:text-base'>
      <p className='mb-2 w-[120px] flex-none font-normal text-gray-500 lg:mb-0'>
        {title}
      </p>
      <select
        {...inputProps}
        className='focus:border-primary h-[40px] w-full max-w-[400px] rounded border border-neutral-300 px-[10px] outline-none'
        onChange={(e) => setValue(e.target.value)}
        value={value}
      >
        <option value='' disabled hidden>
          Choose a {title}
        </option>

        {options.map((option) => (
          <option
            key={option.toLowerCase().replace(/ /g, '-')}
            value={option}
            className='h-[40px]'
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
