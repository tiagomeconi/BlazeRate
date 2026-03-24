# 🎬 BlazeRate

Um site moderno para explorar, pesquisar e favoritar filmes e séries, inspirado no Letterboxd. Desenvolvido com React e consumindo dados da API do TMDB (The Movie Database).

## ✨ Funcionalidades

### 🏠 Página Inicial
- Filmes populares em destaque
- Lançamentos recentes em cartaz
- Filmes mais bem avaliados
- Séries populares
- Interface em carrossel/grid responsiva

### 🔍 Sistema de Busca
- Pesquisa por título de filmes e séries
- Filtros por tipo de conteúdo (Todos, Filmes, Séries)
- Resultados em grid com paginação
- Busca em tempo real

### 📄 Página de Detalhes
- Poster e backdrop em alta qualidade
- Sinopse completa e informações técnicas
- Elenco principal com fotos
- Gêneros e avaliações
- Trailer incorporado do YouTube
- Recomendações relacionadas
- Sistema de favoritos e "assistidos"

### ❤️ Lista Pessoal
- Marcar filmes/séries como favoritos
- Lista de conteúdos assistidos
- Estatísticas pessoais
- Filtros e ordenação
- Dados salvos no LocalStorage

### 📱 Design Responsivo
- Interface moderna e clean
- Totalmente responsivo (desktop e mobile)
- Tema escuro inspirado no Letterboxd
- Animações suaves e transições

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento SPA
- **Styled Components** - Estilização CSS-in-JS
- **Axios** - Cliente HTTP para API
- **TMDB API** - Base de dados de filmes e séries

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para executar

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd BlazeRate
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:5173
   ```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Cabeçalho com navegação e busca
│   └── MovieCard.jsx   # Card de filme/série
├── pages/              # Páginas da aplicação
│   ├── Home.jsx        # Página inicial
│   ├── Search.jsx      # Página de busca
│   ├── MovieDetails.jsx # Detalhes do filme/série
│   └── Favorites.jsx   # Lista de favoritos
├── services/           # Serviços e APIs
│   └── tmdbApi.js      # Configuração da API TMDB
├── hooks/              # Hooks customizados
│   └── useFavorites.js # Gerenciamento de favoritos
└── App.jsx             # Componente principal
```

## 🎨 Características do Design

- **Paleta de Cores**: Tons escuros (#14181c, #2c3440) com accent laranja (#ff6b35)
- **Tipografia**: Inter e system fonts para legibilidade
- **Layout**: Grid responsivo e flexbox
- **Animações**: Hover effects e transições suaves
- **Acessibilidade**: Contraste adequado e navegação por teclado

## 🔑 API TMDB

O projeto utiliza a API gratuita do The Movie Database (TMDB):
- Chave de API incluída para demonstração
- Endpoints para filmes populares, busca, detalhes
- Imagens em múltiplas resoluções
- Dados em português brasileiro

## 📱 Funcionalidades Mobile

- Layout totalmente responsivo
- Touch gestures otimizados
- Menu de navegação adaptativo
- Cards redimensionados para mobile
- Performance otimizada

## 🚀 Próximas Melhorias

- [ ] Sistema de avaliações pessoais
- [ ] Listas personalizadas
- [ ] Compartilhamento social
- [ ] Modo offline com PWA
- [ ] Integração com backend próprio
- [ ] Sistema de usuários e autenticação

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando React e TMDB API**
