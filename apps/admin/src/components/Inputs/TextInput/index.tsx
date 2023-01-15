import React from 'react';

interface InputProps {
  title: string;
  disabled?: boolean;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  inputStyle?: string;
}

const TextInput = ({
  title,
  inputProps,
  disabled = false,
  inputStyle,
}: InputProps) => {
  return (
    <div className='flex w-full flex-col text-sm lg:flex-row lg:items-center lg:space-x-3 lg:text-base'>
      <p className='mb-2 w-[120px] flex-none font-normal text-gray-500 lg:mb-0'>
        {title}
      </p>
      <input
        {...inputProps}
        disabled={disabled}
        className={`focus:border-primary h-[40px] w-full max-w-[400px] rounded border border-neutral-300 px-[10px] outline-none ${
          disabled && 'cursor-not-allowed'
        } ${inputStyle}`}
      />
    </div>
  );
};

export default TextInput;
