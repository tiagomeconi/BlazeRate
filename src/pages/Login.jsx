import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Icon from '../components/Icon';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 32px 72px rgba(0, 0, 0, 0.45);
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.3s ease;
`;

const LogoArea = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.75rem;
`;

const LogoImg = styled.img`
  height: 52px;
  width: auto;
  object-fit: contain;
`;

const Tabs = styled.div`
  display: flex;
  background: ${p => p.theme.colors.background};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 1.75rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.55rem;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.$active ? p.theme.colors.primary : 'transparent'};
  color: ${p => p.$active ? '#fff' : p.theme.colors.textSecondary};
  &:hover:not([disabled]) { color: ${p => p.$active ? '#fff' : p.theme.colors.text}; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 0.9rem;
  background: ${p => p.theme.colors.background};
  border: 1.5px solid ${p => p.$error ? p.theme.colors.error : p.theme.colors.border};
  border-radius: 10px;
  color: ${p => p.theme.colors.text};
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${p => p.$error ? p.theme.colors.error : p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.$error
      ? `${p.theme.colors.error}22`
      : `${p.theme.colors.primary}22`};
  }

  &::placeholder { color: ${p => p.theme.colors.textMuted}; }
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.theme.colors.textMuted};
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  &:hover { color: ${p => p.theme.colors.text}; }
`;

const FieldError = styled.span`
  font-size: 0.775rem;
  color: ${p => p.theme.colors.error};
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.25rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.secondary};
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => p.theme.colors.primary}44;
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  color: ${p => p.theme.colors.textMuted};
  font-size: 0.78rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${p => p.theme.colors.border};
  }
`;

const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.75rem;
  background: ${p => p.theme.colors.background};
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: 10px;
  color: ${p => p.theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${p => p.theme.colors.primary};
    background: ${p => p.theme.colors.surfaceHover};
    transform: translateY(-1px);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const GlobalError = styled.div`
  padding: 0.7rem 0.9rem;
  background: ${p => p.theme.colors.error}18;
  border: 1px solid ${p => p.theme.colors.error}40;
  border-radius: 8px;
  color: ${p => p.theme.colors.error};
  font-size: 0.85rem;
  text-align: center;
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const parseSupabaseError = (message = '') => {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já está em uso.';
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Endereço de e-mail inválido.';
  if (m.includes('rate limit') || m.includes('too many requests')) return 'Muitas tentativas. Aguarde e tente novamente.';
  if (m.includes('network') || m.includes('fetch')) return 'Erro de conexão. Verifique sua internet.';
  return 'Ocorreu um erro. Tente novamente.';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [tab, setTab]           = useState('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [globalError, setGlobalError]     = useState('');
  const [fieldErrors, setFieldErrors]     = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) navigate('/', { replace: true });
  }, [currentUser, navigate]);

  const switchTab = (t) => { setTab(t); setGlobalError(''); setFieldErrors({}); };

  const validate = () => {
    const errors = {};
    if (tab === 'register' && !name.trim()) errors.name = 'Informe seu nome.';
    if (!email.trim()) errors.email = 'Informe seu e-mail.';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'E-mail inválido.';
    if (!password) errors.password = 'Informe sua senha.';
    else if (password.length < 6) errors.password = 'Mínimo de 6 caracteres.';
    if (tab === 'register' && password !== confirm) errors.confirm = 'As senhas não coincidem.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({});
    try {
      setLoading(true);
      if (tab === 'login') await signInWithEmail(email, password);
      else await registerWithEmail(name.trim(), email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setGlobalError(parseSupabaseError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGlobalError('');
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setGlobalError(parseSupabaseError(err.message));
      setGoogleLoading(false);
    }
  };

  const isLogin = tab === 'login';

  return (
    <Page theme={theme}>
      <Card theme={theme}>
        <LogoArea>
          <LogoImg src="/Blaze-Rate-Logo.png" alt="BlazeRate" />
        </LogoArea>

        <Tabs theme={theme}>
          <Tab theme={theme} $active={isLogin} onClick={() => switchTab('login')}>Entrar</Tab>
          <Tab theme={theme} $active={!isLogin} onClick={() => switchTab('register')}>Criar conta</Tab>
        </Tabs>

        <Form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <Field>
              <Label theme={theme}>Nome</Label>
              <Input theme={theme} type="text" placeholder="Seu nome" value={name}
                onChange={(e) => setName(e.target.value)} $error={!!fieldErrors.name} autoComplete="name" />
              {fieldErrors.name && <FieldError theme={theme}>{fieldErrors.name}</FieldError>}
            </Field>
          )}

          <Field>
            <Label theme={theme}>E-mail</Label>
            <Input theme={theme} type="email" placeholder="seu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} $error={!!fieldErrors.email} autoComplete="email" />
            {fieldErrors.email && <FieldError theme={theme}>{fieldErrors.email}</FieldError>}
          </Field>

          <Field>
            <Label theme={theme}>Senha</Label>
            <InputWrapper>
              <Input theme={theme} type={showPass ? 'text' : 'password'}
                placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                $error={!!fieldErrors.password}
                autoComplete={isLogin ? 'current-password' : 'new-password'} />
              <TogglePassword type="button" theme={theme} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                <Icon name={showPass ? 'visibility_off' : 'visibility'} size={18} />
              </TogglePassword>
            </InputWrapper>
            {fieldErrors.password && <FieldError theme={theme}>{fieldErrors.password}</FieldError>}
          </Field>

          {!isLogin && (
            <Field>
              <Label theme={theme}>Confirmar senha</Label>
              <InputWrapper>
                <Input theme={theme} type={showConf ? 'text' : 'password'}
                  placeholder="Repita a senha" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  $error={!!fieldErrors.confirm} autoComplete="new-password" />
                <TogglePassword type="button" theme={theme} onClick={() => setShowConf(v => !v)} tabIndex={-1}>
                  <Icon name={showConf ? 'visibility_off' : 'visibility'} size={18} />
                </TogglePassword>
              </InputWrapper>
              {fieldErrors.confirm && <FieldError theme={theme}>{fieldErrors.confirm}</FieldError>}
            </Field>
          )}

          {globalError && <GlobalError theme={theme}>{globalError}</GlobalError>}

          <SubmitBtn type="submit" theme={theme} disabled={loading || googleLoading}>
            {loading ? <Spinner /> : (isLogin ? 'Entrar' : 'Criar conta')}
          </SubmitBtn>
        </Form>

        <Divider theme={theme}>ou continue com</Divider>

        <GoogleBtn onClick={handleGoogle} disabled={loading || googleLoading} theme={theme}>
          <GoogleIcon />
          {googleLoading ? 'Conectando...' : 'Entrar com Google'}
        </GoogleBtn>
      </Card>
    </Page>
  );
};

export default LoginPage;
