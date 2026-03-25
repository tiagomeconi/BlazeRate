import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserProfile } from '../services/supabase';
import { tmdbApi, getImageUrl } from '../services/tmdbApi';

/* ── animations ──────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

/* ── layout ──────────────────────────────────────────────── */
const Page = styled.div`
  min-height: 100vh;
  background: ${p => p.theme.colors.background};
  padding: 2.5rem 1rem 4rem;
`;

const Inner = styled.div`
  max-width: 520px;
  margin: 0 auto;
  animation: ${fadeUp} 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s;
  &:hover { color: ${p => p.theme.colors.text}; }
`;

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
`;

/* ── avatar area ─────────────────────────────────────────── */
const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const AvatarRing = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  cursor: pointer;

  &:hover > div { opacity: 1; }
`;

const AvatarImg = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${p => p.theme.colors.primary};
  display: block;
`;

const AvatarEditOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  gap: 0.25rem;
`;

const AvatarEditLabel = styled.span`
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const ChangeAvatarBtn = styled.button`
  margin-top: 0.75rem;
  background: transparent;
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: 50px;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  &:hover {
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`;

/* ── form ────────────────────────────────────────────────── */
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${p => p.theme.colors.background};
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: 10px;
  color: ${p => p.theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${p => p.theme.colors.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.colors.primary}22;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder { color: ${p => p.theme.colors.textMuted}; }
`;

const SaveBtn = styled.button`
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.5rem;
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${p => p.theme.colors.secondary};
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${p => p.theme.colors.primary}44;
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const SavedMsg = styled.span`
  color: ${p => p.theme.colors.success};
  font-size: 0.82rem;
  text-align: center;
  display: block;
  margin-top: 0.75rem;
`;

/* ── avatar picker modal ─────────────────────────────────── */
const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeUp} 0.2s ease both;
`;

const PickerModal = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 72px rgba(0,0,0,0.7);
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  flex-shrink: 0;
`;

const PickerTitle = styled.h2`
  color: ${p => p.theme.colors.text};
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;

const PickerClose = styled.button`
  background: none;
  border: none;
  color: ${p => p.theme.colors.textMuted};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.2s, background 0.2s;
  &:hover { color: ${p => p.theme.colors.text}; background: ${p => p.theme.colors.surfaceHover}; }
`;

const PickerGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 1rem;

  scrollbar-width: thin;
  scrollbar-color: ${p => p.theme.colors.border} transparent;
`;

const SkeletonAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 0.5rem;
  background: linear-gradient(90deg,
    ${p => p.theme.colors.surface} 25%,
    ${p => p.theme.colors.surfaceHover} 50%,
    ${p => p.theme.colors.surface} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

const AvatarOption = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  transition: transform 0.2s;

  &:hover { transform: scale(1.06); }
`;

const AvatarOptionImg = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${p => p.$selected ? p.theme.colors.primary : 'transparent'};
  box-shadow: ${p => p.$selected ? `0 0 0 2px ${p.theme.colors.primary}` : 'none'};
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
`;

const AvatarOptionName = styled.span`
  color: ${p => p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary};
  font-size: 0.68rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  max-width: 88px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
`;

const CheckBadge = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.colors.primary}cc;
  opacity: ${p => p.$show ? 1 : 0};
  transition: opacity 0.15s;
`;

const AvatarOptionWrap = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
`;

const PickerFooter = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid ${p => p.theme.colors.border};
  flex-shrink: 0;
`;

const PickerCancelBtn = styled.button`
  flex: 1;
  padding: 0.7rem;
  background: transparent;
  border: 1.5px solid ${p => p.theme.colors.border};
  border-radius: 10px;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.text}; }
`;

const PickerConfirmBtn = styled.button`
  flex: 1;
  padding: 0.7rem;
  background: ${p => p.theme.colors.primary};
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.theme.colors.secondary}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── component ───────────────────────────────────────────── */
const Profile = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL]       = useState('');
  const [showPicker, setShowPicker]   = useState(false);
  const [tempAvatar, setTempAvatar]   = useState('');
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    setDisplayName(currentUser.displayName || '');
    setPhotoURL(currentUser.photoURL || '');
  }, [currentUser, navigate]);

  const openPicker = async () => {
    setTempAvatar(photoURL);
    setShowPicker(true);
    if (avatarOptions.length > 0) return;

    setLoadingAvatars(true);
    try {
      const [p1, p2] = await Promise.all([
        tmdbApi.getPopularPersons(1),
        tmdbApi.getPopularPersons(2),
      ]);
      const persons = [...p1.data.results, ...p2.data.results]
        .filter(p => p.profile_path);
      setAvatarOptions(persons.slice(0, 32));
    } catch {
      // silently ignore
    } finally {
      setLoadingAvatars(false);
    }
  };

  const confirmAvatar = () => {
    if (tempAvatar) setPhotoURL(tempAvatar);
    setShowPicker(false);
  };

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Informe seu nome.'); return; }
    setError('');
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        displayName: displayName.trim(),
        photoURL,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const avatarSrc = photoURL || '/placeholder-avatar.svg';

  return (
    <Page theme={theme}>
      <Inner>
        <BackBtn to="/" theme={theme}>
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
          Voltar
        </BackBtn>

        <Card theme={theme}>
          {/* avatar */}
          <AvatarSection>
            <AvatarRing onClick={openPicker}>
              <AvatarImg src={avatarSrc} alt="Avatar" theme={theme} />
              <AvatarEditOverlay>
                <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#fff' }}>edit</span>
                <AvatarEditLabel>ALTERAR</AvatarEditLabel>
              </AvatarEditOverlay>
            </AvatarRing>
            <ChangeAvatarBtn onClick={openPicker} theme={theme}>
              <span className="material-symbols-rounded" style={{ fontSize: 15 }}>person</span>
              Escolher personagem
            </ChangeAvatarBtn>
          </AvatarSection>

          {/* fields */}
          <Field>
            <Label theme={theme}>Nome</Label>
            <Input
              theme={theme}
              type="text"
              placeholder="Seu nome"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </Field>

          <Field>
            <Label theme={theme}>E-mail</Label>
            <Input
              theme={theme}
              type="email"
              value={currentUser.email || ''}
              disabled
            />
          </Field>

          {error && (
            <p style={{ color: theme.colors.error, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}

          <SaveBtn theme={theme} onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : (
              <>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>save</span>
                Salvar alterações
              </>
            )}
          </SaveBtn>

          {saved && <SavedMsg theme={theme}>✓ Perfil atualizado com sucesso!</SavedMsg>}
        </Card>
      </Inner>

      {/* avatar picker */}
      {showPicker && (
        <PickerOverlay onClick={e => e.target === e.currentTarget && setShowPicker(false)}>
          <PickerModal theme={theme}>
            <PickerHeader theme={theme}>
              <PickerTitle theme={theme}>Escolha seu personagem</PickerTitle>
              <PickerClose theme={theme} onClick={() => setShowPicker(false)}>
                <span className="material-symbols-rounded" style={{ fontSize: 22 }}>close</span>
              </PickerClose>
            </PickerHeader>

            <PickerGrid theme={theme}>
              {loadingAvatars
                ? [...Array(24)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <SkeletonAvatar theme={theme} />
                      <div style={{
                        width: 60, height: 10, borderRadius: 4,
                        background: theme.colors.surfaceHover,
                      }} />
                    </div>
                  ))
                : avatarOptions.map(person => {
                    const url = getImageUrl(person.profile_path, 'w185');
                    const isSelected = tempAvatar === url;
                    return (
                      <AvatarOption key={person.id} onClick={() => setTempAvatar(url)}>
                        <AvatarOptionWrap>
                          <AvatarOptionImg
                            src={url}
                            alt={person.name}
                            theme={theme}
                            $selected={isSelected}
                          />
                          <CheckBadge theme={theme} $show={isSelected}>
                            <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#fff', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          </CheckBadge>
                        </AvatarOptionWrap>
                        <AvatarOptionName theme={theme} $selected={isSelected}>
                          {person.name}
                        </AvatarOptionName>
                      </AvatarOption>
                    );
                  })
              }
            </PickerGrid>

            <PickerFooter theme={theme}>
              <PickerCancelBtn theme={theme} onClick={() => setShowPicker(false)}>
                Cancelar
              </PickerCancelBtn>
              <PickerConfirmBtn theme={theme} onClick={confirmAvatar} disabled={!tempAvatar}>
                Confirmar
              </PickerConfirmBtn>
            </PickerFooter>
          </PickerModal>
        </PickerOverlay>
      )}
    </Page>
  );
};

export default Profile;
