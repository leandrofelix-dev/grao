import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    color-scheme: ${({ theme }) => theme.mode};
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1.125rem;
    font-weight: 400;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    min-height: 100dvh;
    line-height: 1.6;
    font-optical-sizing: auto;
  }

  h1, h2, h3 {
    font-family: ${({ theme }) => theme.fonts.display};
    font-weight: 500;
    font-optical-sizing: auto;
    line-height: 1.05;
    color: ${({ theme }) => theme.colors.text};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font: inherit;
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  img {
    display: block;
    max-width: 100%;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.bg};
  }
`;
