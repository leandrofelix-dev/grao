import styled from "styled-components";
import { metaText } from "../theme/textStyles.js";

const Foot = styled.footer`
  margin-top: auto;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: ${({ theme }) => theme.spacing["3xl"]}
    ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing["2xl"]};
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-left: ${({ theme }) => theme.spacing["2xl"]};
    padding-right: ${({ theme }) => theme.spacing["2xl"]};
  }
`;

const Tagline = styled.p`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.125rem, 3vw, 1.375rem);
  font-weight: 400;
  font-optical-sizing: auto;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.2;
`;

const Meta = styled.p`
  ${metaText}
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-transform: none;
  letter-spacing: 0.08em;
`;

const CreditLink = styled.a`
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Foot>
      <Tagline>ser real é raro</Tagline>
      <Meta>
        © {year} grão by{" "}
        <CreditLink
          href="https://github.com/leandrofelix-dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          leandrofelix
        </CreditLink>
      </Meta>
    </Foot>
  );
}
