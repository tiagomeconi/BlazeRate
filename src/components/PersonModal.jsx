import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { tmdbApi, getImageUrl } from '../services/tmdbApi';
import { useTheme } from '../contexts/ThemeContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
  animation: ${slideUp} 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  scrollbar-width: thin;
  scrollbar-color: ${p => p.theme.colors.border} transparent;
`;

const Header = styled.div`
  display: flex;
  gap: 1.75rem;
  padding: 2rem 2rem 1.5rem;
  position: relative;

  @media (max-width: 540px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${p => p.theme.colors.surfaceHover};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${p => p.theme.colors.textSecondary};
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${p => p.theme.colors.border};
    color: ${p => p.theme.colors.text};
  }
`;

const Avatar = styled.img`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid ${p => p.theme.colors.primary}55;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const HeaderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 2.5rem;
`;

const PersonName = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${p => p.theme.colors.text};
  margin: 0 0 0.4rem;
  line-height: 1.2;
`;

const Department = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${p => p.theme.colors.primary};
  margin: 0 0 0.85rem;
`;

const StatRow = styled.div`
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;

  @media (max-width: 540px) { justify-content: center; }
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${p => p.theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const Divider = styled.div`
  height: 1px;
  background: ${p => p.theme.colors.border};
  margin: 0 2rem;
`;

const Body = styled.div`
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const Section = styled.div`
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: ${p => p.theme.colors.textMuted};
  margin: 0 0 0.75rem;
`;

const Bio = styled.p`
  font-size: 0.92rem;
  line-height: 1.8;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0;
`;

const FilmRowWrapper = styled.div`
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0.75rem;
    width: 60px;
    z-index: 1;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, ${p => p.theme.colors.surface}, transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, ${p => p.theme.colors.surface}, transparent);
  }
`;

const FilmRow = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  scroll-behavior: smooth;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const RowArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(calc(-50% - 0.375rem));
  ${p => p.$side === 'left' ? 'left: 4px;' : 'right: 4px;'}
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  color: ${p => p.theme.colors.text};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme.colors.surfaceHover};
    border-color: ${p => p.theme.colors.primary};
    color: ${p => p.theme.colors.primary};
  }
`;

const FilmCard = styled.div`
  flex-shrink: 0;
  width: 90px;
  text-align: center;
  cursor: default;
`;

const FilmPoster = styled.img`
  width: 90px;
  height: 135px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${p => p.theme.colors.border};
  margin-bottom: 0.4rem;
  display: block;
`;

const FilmTitle = styled.p`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => p.theme.colors.textSecondary};
  margin: 0 0 0.15rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FilmYear = styled.p`
  font-size: 0.65rem;
  color: ${p => p.theme.colors.textMuted};
  margin: 0;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2.5px solid ${p => p.theme.colors.border};
  border-top-color: ${p => p.theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin: 3rem auto;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const calcAge = (birthday, deathday) => {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const birth = new Date(birthday);
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const PersonModal = ({ personId, onClose }) => {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const moviesRowRef = useRef(null);
  const showsRowRef = useRef(null);

  const scroll = (ref, dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        const res = await tmdbApi.getPersonDetails(personId);
        setPerson(res.data);
      } catch {
        setPerson(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [personId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const age = person ? calcAge(person.birthday, person.deathday) : null;

  // Top filmes por popularidade (com poster)
  const topMovies = person?.movie_credits?.cast
    ?.filter(m => m.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12) || [];

  const topShows = person?.tv_credits?.cast
    ?.filter(s => s.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8) || [];

  const deptLabel = {
    Acting: 'Ator / Atriz',
    Directing: 'Diretor(a)',
    Writing: 'Roteirista',
    Production: 'Produtor(a)',
  };

  return (
    <Overlay onClick={onClose}>
      <Modal theme={theme} onClick={e => e.stopPropagation()}>
        <CloseBtn theme={theme} onClick={onClose} aria-label="Fechar">
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span>
        </CloseBtn>

        {loading ? (
          <Spinner theme={theme} />
        ) : !person ? (
          <Body><Bio theme={theme}>Não foi possível carregar as informações.</Bio></Body>
        ) : (
          <>
            <Header>
              <Avatar
                theme={theme}
                src={getImageUrl(person.profile_path, 'w342')}
                alt={person.name}
              />
              <HeaderInfo>
                <PersonName theme={theme}>{person.name}</PersonName>
                {person.known_for_department && (
                  <Department theme={theme}>
                    {deptLabel[person.known_for_department] || person.known_for_department}
                  </Department>
                )}
                <StatRow>
                  {person.birthday && (
                    <Stat theme={theme}>
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>cake</span>
                      {formatDate(person.birthday)}
                      {age !== null && ` · ${person.deathday ? `faleceu aos ${age}` : `${age} anos`}`}
                    </Stat>
                  )}
                  {person.place_of_birth && (
                    <Stat theme={theme}>
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>location_on</span>
                      {person.place_of_birth}
                    </Stat>
                  )}
                </StatRow>
              </HeaderInfo>
            </Header>

            <Divider theme={theme} />

            <Body>
              {person.biography ? (
                <Section>
                  <SectionTitle theme={theme}>Biografia</SectionTitle>
                  <Bio theme={theme}>{person.biography}</Bio>
                </Section>
              ) : null}

              {topMovies.length > 0 && (
                <Section>
                  <SectionTitle theme={theme}>Filmes em Destaque</SectionTitle>
                  <FilmRowWrapper theme={theme}>
                    <RowArrow $side="left" theme={theme} onClick={() => scroll(moviesRowRef, -1)} aria-label="Anterior">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_left</span>
                    </RowArrow>
                    <FilmRow ref={moviesRowRef}>
                      {topMovies.map(m => (
                        <FilmCard key={m.id}>
                          <FilmPoster theme={theme} src={getImageUrl(m.poster_path, 'w185')} alt={m.title} loading="lazy" />
                          <FilmTitle theme={theme}>{m.title}</FilmTitle>
                          <FilmYear theme={theme}>{m.release_date ? new Date(m.release_date).getFullYear() : ''}</FilmYear>
                        </FilmCard>
                      ))}
                    </FilmRow>
                    <RowArrow $side="right" theme={theme} onClick={() => scroll(moviesRowRef, 1)} aria-label="Próximo">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_right</span>
                    </RowArrow>
                  </FilmRowWrapper>
                </Section>
              )}

              {topShows.length > 0 && (
                <Section>
                  <SectionTitle theme={theme}>Séries em Destaque</SectionTitle>
                  <FilmRowWrapper theme={theme}>
                    <RowArrow $side="left" theme={theme} onClick={() => scroll(showsRowRef, -1)} aria-label="Anterior">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_left</span>
                    </RowArrow>
                    <FilmRow ref={showsRowRef}>
                      {topShows.map(s => (
                        <FilmCard key={s.id}>
                          <FilmPoster theme={theme} src={getImageUrl(s.poster_path, 'w185')} alt={s.name} loading="lazy" />
                          <FilmTitle theme={theme}>{s.name}</FilmTitle>
                          <FilmYear theme={theme}>{s.first_air_date ? new Date(s.first_air_date).getFullYear() : ''}</FilmYear>
                        </FilmCard>
                      ))}
                    </FilmRow>
                    <RowArrow $side="right" theme={theme} onClick={() => scroll(showsRowRef, 1)} aria-label="Próximo">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>chevron_right</span>
                    </RowArrow>
                  </FilmRowWrapper>
                </Section>
              )}
            </Body>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

export default PersonModal;
