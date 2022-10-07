import React, { useEffect } from 'react';

interface SelectProps {
  title: string;
  options: string[];
  setValue: React.Dispatch<React.SetStateAction<any>>;
  inputProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
  dep?: any;
}

const Select = ({
  title,
  setValue,
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
    <div className='flex flex-col w-full text-sm lg:items-center lg:flex-row lg:text-base lg:space-x-3'>
      <p className='mb-2 font-normal lg:mb-0 w-[120px] flex-none text-gray-500'>
        {title}
      </p>
      <select
        {...inputProps}
        className='focus:border-primary max-w-[400px] w-full outline-none border h-[40px] px-[10px] rounded border-neutral-300'
        onChange={(e) => setValue(e.target.value)}
        defaultValue=''
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
