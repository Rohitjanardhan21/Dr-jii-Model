import { BsClipboardData } from "react-icons/bs";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const InlineError = ({ text }) => {
  return (
    <div className='mt-2 w-full text-xs font-medium text-red-600'>
      <p>{text}</p>
    </div>
  );
};

export const Error = ({ text }) => {
  return (
    <div className='flex-colo my-12 w-full gap-2'>
      <img
        src='/images/notfound.svg'
        alt='404'
        className='h-56 w-full object-contain'
      />
      <h1 className='my-4 text-center text-2xl font-bold text-red-600'>
        Error
      </h1>
      <p className='text-center text-sm'>{text}</p>
      <Link to='/'>
        <button className='mt-4 rounded bg-subMain px-8 py-2 text-white'>
          Go Back
        </button>
      </Link>
    </div>
  );
};

export const Empty = ({ text }) => {
  return (
    <div className='flex-colo my-12 w-full gap-2'>
      <div className='flex-colo h-24 w-24 rounded-full bg-subMain text-white'>
        <BsClipboardData className='text-2xl' />
      </div>
      <h1 className='text-center text-sm font-bold'>{text}</h1>
    </div>
  );
};

// copy
export const Copy = ({ text, children }) => {
  return <CopyToClipboard text={text}>{children}</CopyToClipboard>;
};
