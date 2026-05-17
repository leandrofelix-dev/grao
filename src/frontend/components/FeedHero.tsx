import styled from "styled-components";
import { LogoImg } from "./Layout";

const Hero = styled.section`
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl}
    ${({ theme }) => theme.spacing.xl};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing.md}
      ${({ theme }) => theme.spacing["2xl"]}
      ${({ theme }) => theme.spacing["2xl"]};
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 500;
  font-optical-sizing: auto;
  line-height: 0.95;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export function FeedHero() {
  return <></>;
}
