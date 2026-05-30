import { useState, useEffect } from 'react';
import styles from './Trainerdex.module.css';
import Navbar from '../../components/Navbar';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';

const LIMIT = 48; // de preferencia tem q ser multiplo de 6 pra fechar a grid certinho 

export default function TrainerDex() {
  const router = useRouter();
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchPage(page) {
      setLoading(true);
      try {
        const offset = (page - 1) * LIMIT;
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`);
        const data = await res.json();

        const listaPokemon = data.results.map((p) => {
          const id = parseInt(p.url.split('/').filter(Boolean).pop()); // pega o ultima item da url ex:"https://pokeapi.co/api/v2/pokemon/25/"
          return {
            id,
            name:   p.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });

        setPokemons(listaPokemon);
        setTotalPages(Math.ceil(data.count / LIMIT));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const textsearch = search.toLowerCase().trim();
    if (!textsearch) {
      setFiltered(pokemons);
    } else {
      setFiltered(
        pokemons.filter(
          (p) =>
            p.name.toLowerCase().includes(textsearch) ||
            String(p.id).padStart(4, '0').includes(textsearch)
        )
      );
    }
  }, [search, pokemons]);


  const formatId = (id) => `#${String(id).padStart(4, '0')}`; // Coloca os zeros na esquerda pra deixar o ID certinho
  const formatName = (name) => name.charAt(0).toUpperCase() + name.slice(1);

  const goTo = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // paginas visíveis ao redor da atual
  const getPageRange = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  return (
    <>
      <Navbar />
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>

          <div className={styles.topTextBox}>
            <label>Pokémons</label>
            <div className={styles.filters}>
              <label>Filtros</label>
              <Icon icon="mdi:filter-variant" width="24" height="24" />
            </div>
          </div>

          <div className={styles.searchContainer}>
            <input
              className={styles.searchInput}
              placeholder="Pesquise por seus pokemons favoritos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon
              icon="mdi:magnify"
              width="22"
              height="22"
              color="var(--textColor)"
              className={styles.searchIcon}
            />
          </div>

          {loading ? (
            <p className={styles.loadingText}>Carregando Pokémons...</p>
          ) : (
            <>
              <div className={styles.grid}>
                {filteredPokemons.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={styles.card}
                    onClick={() => router.push(`/pokemon/${pokemon.id}`)}
                  >
                    <span className={styles.cardId}>{formatId(pokemon.id)}</span>
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className={styles.cardImage}
                    />
                    <span className={styles.cardName}>{formatName(pokemon.name)}</span>
                  </div>
                ))}
              </div>


              {!search && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => goTo(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="mdi:chevron-left" width="18" height="18" />
                  </button>

                  {currentPage > 3 && (
                    <>
                      <button className={styles.pageBtn} onClick={() => goTo(1)}>1</button>
                      {currentPage > 4 && <span className={styles.ellipsis}>...</span>}
                    </>
                  )}

                  {getPageRange().map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${page === currentPage ? styles.pageBtnActive : ''}`}
                      onClick={() => goTo(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className={styles.ellipsis}>...</span>}
                      <button className={styles.pageBtn} onClick={() => goTo(totalPages)}>{totalPages}</button>
                    </>
                  )}

                  <button
                    className={styles.pageBtn}
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Icon icon="mdi:chevron-right" width="18" height="18" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
