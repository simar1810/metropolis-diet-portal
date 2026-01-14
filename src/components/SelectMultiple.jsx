import { useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';

const alignClasses = {
  top: "bottom-[120%]",
  bottom: "bottom-[100%]"
}

export default function SelectMultiple({
  label,
  options,
  value,
  onChange,
  className = '',
  selectAll = false,
  align = "top"
}) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef();

  useClickOutside(dropdownRef, () => setIsOpen(false))

  function toggleOption(selectedValue) {
    const newValue = value.includes(selectedValue)
      ? value.filter((v) => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newValue);
  };

  function toggleSelectAll() {
    if (value.length === options.length) {
      onChange([])
    } else {
      onChange(options.map(option => option.value))
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="flex items-center justify-between">
        {/* <span className="label font-[600] block mb-1">{label || <>Select</>}</span> */}
      </div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-[#D6D6D6] rounded-[8px] bg-white cursor-pointer flex justify-between items-center"
      >
        <span className="w-full text-sm text-gray-700 truncate overflow-clip">
          {label
            ? label
            : value.length ? value.slice(0, 4).join(', ') : 'Select options'}
        </span>
        <span className="text-sm text-nowrap">{value.length} selected</span>
        {/* <ChevronDown className="w-4 h-4 text-gray-500" /> */}
        {isOpen ? <X
          className="hover:text-[var(--accent-2)] w-[20px] h-[20px] ml-2 opacity-50 hover:opacity-100 hover:scale-[1.1]"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          strokeWidth={3}
        /> : <div className='w-[30px] h-[20px]' />}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-10 h-40 mt-1 w-full bg-white border border-[#D6D6D6] rounded-[8px] shadow-lg max-h-60 overflow-y-auto",
            alignClasses[align]
          )}
        >
          {selectAll && <label
            className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            <input
              type="checkbox"
              className="mr-2"
              checked={options.length === value.length}
              onChange={toggleSelectAll}
            />
            All
          </label>}
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mr-2"
                checked={value.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
