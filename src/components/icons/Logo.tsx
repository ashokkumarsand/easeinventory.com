import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M154 30H46C37.1634 30 30 37.1634 30 46V154C30 162.837 37.1634 170 46 170H154C162.837 170 170 162.837 170 154V46C170 37.1634 162.837 30 154 30Z"
        fill="#6A3BF6"
      />
      <path
        d="M87 105H53C48.5817 105 45 108.582 45 113V147C45 151.418 48.5817 155 53 155H87C91.4183 155 95 151.418 95 147V113C95 108.582 91.4183 105 87 105Z"
        fill="#EDE8D0"
      />
      <path
        d="M147 105H113C108.582 105 105 108.582 105 113V147C105 151.418 108.582 155 113 155H147C151.418 155 155 151.418 155 147V113C155 108.582 151.418 105 147 105Z"
        fill="#EDE8D0"
      />
      <path
        d="M87 45H53C48.5817 45 45 48.5817 45 53V87C45 91.4183 48.5817 95 53 95H87C91.4183 95 95 91.4183 95 87V53C95 48.5817 91.4183 45 87 45Z"
        fill="#EDE8D0"
      />
      <path
        d="M147 45H113C108.582 45 105 48.5817 105 53V87C105 91.4183 108.582 95 113 95H147C151.418 95 155 91.4183 155 87V53C155 48.5817 151.418 45 147 45Z"
        fill="#EDE8D0"
      />
    </svg>
  );
};

export const LogoWithText: React.FC<LogoProps & { showText?: boolean }> = ({
  size = 40,
  className = '',
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-foreground">Ease</span>
          <span className="text-primary">Inventory</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
