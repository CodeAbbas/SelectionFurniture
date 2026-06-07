import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name?: string;
          class?: string;
          size?: string;
        },
        HTMLElement
      >;
    }
  }
}
