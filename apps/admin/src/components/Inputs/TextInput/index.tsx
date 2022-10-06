import React from 'react';

interface InputProps {
  title: string;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

const TextInput = ({ title, inputProps }: InputProps) => {
  return (
    <div className='flex flex-col w-full text-sm lg:items-center lg:flex-row lg:text-base space-x-3'>
      <p className='mb-2 font-normal lg:mb-0 w-[120px] flex-none text-gray-500'>
        {title}
      </p>
      <input
        {...inputProps}
        className='focus:border-primary max-w-[400px] w-full outline-none border h-[40px] px-[10px] rounded border-neutral-300'
      />
    </div>
  );
};

export default TextInput;
