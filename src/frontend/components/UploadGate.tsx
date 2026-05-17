import { useState } from 'react';
import styled from 'styled-components';
import { verifyUploadPassword } from '../lib/api.js';
import { metaText } from '../theme/textStyles.js';

const Wrap = styled.div`
  max-width: 360px;
  margin: ${({ theme }) => theme.spacing['3xl']} auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  ${metaText}
`;

const Input = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  letter-spacing: 0.02em;
  text-transform: none;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.text};
  }
`;

const Submit = styled.button`
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.bg};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-size: 0.8125rem;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  ${metaText}
  color: ${({ theme }) => theme.colors.error};
  text-transform: none;
  letter-spacing: 0.02em;
`;

interface UploadGateProps {
  onUnlocked: () => void;
}

export function UploadGate({ onUnlocked }: UploadGateProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('informe a senha');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyUploadPassword(password);
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Form onSubmit={onSubmit}>
        <Label>
          senha
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            autoFocus
            required
          />
        </Label>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Submit type="submit" disabled={loading}>
          {loading ? 'verificando…' : 'entrar'}
        </Submit>
      </Form>
    </Wrap>
  );
}
