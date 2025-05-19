/**
 * Type definitions for A-Frame elements in JSX
 */

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-assets': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-videosphere': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-camera': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-sky': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-sphere': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;
      'a-cursor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & any, HTMLElement>;

      // Regular HTML elements
      'div': any;
      'span': any;
      'button': any;
      'video': any;
      'audio': any;
      'img': any;
      'input': any;
      'label': any;
      'p': any;
      'h1': any;
      'h2': any;
      'h3': any;
      'h4': any;
      'h5': any;
      'h6': any;
      'a': any;
      'ul': any;
      'li': any;
      'nav': any;
      'header': any;
      'footer': any;
      'main': any;
      'section': any;
      'article': any;
      'aside': any;
    }
  }
} 