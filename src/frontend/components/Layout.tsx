import { Link, useLocation } from "react-router";
import type { ReactNode } from "react";
import styled from "styled-components";
import { Footer } from "./Footer.js";
import { ThemeToggle } from "./ThemeToggle.js";

const Shell = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bg};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing.xl}
      ${({ theme }) => theme.spacing["2xl"]};
  }
`;

const Logo = styled(Link)`
  display: block;
  line-height: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.55;
  }
`;

export const LogoImg = styled.img`
  height: 2.25rem;
  width: auto;
  display: block;
  filter: ${({ theme }) => (theme.mode === "light" ? "brightness(0)" : "none")};
`;

const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Main = styled.main<{ $wide?: boolean }>`
  flex: 1;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? "none" : "440px")};
  margin: 0 auto;
  padding: ${({ theme, $wide }) => ($wide ? 0 : theme.spacing.xl)};
`;

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isFeed = pathname === "/" || pathname === "/upload";

  return (
    <Shell>
      <Header>
        <Logo to="/" aria-label="grão">
          <LogoImg src="/grao.svg" alt="" />
        </Logo>
        <HeaderNav aria-label="Navegação">
          <ThemeToggle />
        </HeaderNav>
      </Header>
      <Main $wide={isFeed}>{children}</Main>
      <Footer />
    </Shell>
  );
}
