
import React from 'react';

export const HandshakeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 17a2 2 0 0 1-2 2H6l-4 4V1a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v7.5" />
    <path d="m14 12.5 3-3 2 2.5" />
    <path d="m14 17.5 3-3 2 2.5" />
    <path d="m9 13 3-3 2 2.5" />
    <path d="m9 8 3-3 2 2.5" />
  </svg>
);
