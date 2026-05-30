import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { Icon } from '@iconify/react';
import styles from './Pokemon.module.css';

// as cores de cada tipo
const typeColors = {
  normal:   '#A8A878',
  fire:     '#F08030',
  water:    '#6890F0',
  electric: '#F8D030',
  grass:    '#5a9e3a',
  ice:      '#98D8D8',
  fighting: '#C03028',
  poison:   '#9B59B6',
  ground:   '#E0C068',
  flying:   '#A890F0',
  psychic:  '#F85888',
  bug:      '#A8B820',
  rock:     '#B8A038',
  ghost:    '#705898',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  fairy:    '#EE99AC',
};

// dict dos nomes dos status para exibição
const statLabels = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

// cor dos status com base no tamanho do valor
function getStatColor(value) {
  if (value >= 100) return '#78C850';
  if (value >= 70)  return '#a8d858';
  if (value >= 50)  return '#DCE86E';
  return '#F8A040';
}

// função que faz um array de objetos com todas evoluções do pokemon
function flattenEvolutionChain(chain) {
  const result = [];
  function traverse(node, level = null) {
    const id = parseInt(node.species.url.split('/').filter(Boolean).pop());
    result.push({ id, name: node.species.name, level });
    if (node.evolves_to?.length > 0) {
      node.evolves_to.forEach((evo) => {
        const minLevel = evo.evolution_details?.[0]?.min_level || null;
        traverse(evo, minLevel);
      });
    }
  }
  traverse(chain);
  return result;
}


function romanToNumber(genName) {
  const map = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };
  const part = genName.replace('generation-', '');
  return map[part] ?? genName;
}

function formatGrowthRate(name) {
  const map = {
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
    'medium-slow': 'Medium slow',
    'slow-then-very-fast': 'Erratic',
    'fast-then-very-slow': 'Fluctuating',
  };
  return map[name] || name;
}

function captalizar(str) {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function PokemonDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evoChain, setEvoChain] = useState([]);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      try {
        
        const [pkRes, spRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);
        const pkData = await pkRes.json();
        const spData = await spRes.json();

        // Cadeia de evolução
        const evoRes  = await fetch(spData.evolution_chain.url);
        const evoData = await evoRes.json();
        const chain   = flattenEvolutionChain(evoData.chain);

        // Busca tipos de cada pokémon da cadeia
        const evoDetails = await Promise.all(
          chain.map((e) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${e.id}`).then((r) => r.json())
          )
        );
        const chainWithTypes = chain.map((e, i) => ({
          ...e,
          types: evoDetails[i].types.map((t) => t.type.name),
        }));

        // Movimentos por level-up (primeiros 8) com tipo
        const lvlMoves = pkData.moves
          .filter((m) =>
            m.version_group_details.some(
              (vg) => vg.move_learn_method.name === 'level-up'
            )
          );

        const movesData = await Promise.all(
          lvlMoves.map((m) => fetch(m.move.url).then((r) => r.json()))
        );
        const movesFormatted = movesData.map((m) => ({
          name: captalizar(m.name),
          type: m.type.name,
        }));

        setPokemon(pkData);
        setSpecies(spData);
        setEvoChain(chainWithTypes);
        setMoves(movesFormatted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const backBtn = (
    <button className={styles.backButton} onClick={() => router.push('/Trainerdex')}>
      <Icon icon="mdi:arrow-left" width="16" height="16" />
      Voltar
    </button>
  );

  if (loading || !pokemon || !species) {
    return (
      <>
        <Navbar rightContent={backBtn} />
        <div className={styles.loadingWrapper}>
          <p className={styles.loadingText}>Carregando...</p>
        </div>
      </>
    );
  }

  // Flavor texts em inglês
  const flavorTexts = species.flavor_text_entries
    .filter((f) => f.language.name === 'en')
    .slice(0, 2)
    .map((f) => f.flavor_text.replace(/[\n\f]/g, ' '));

  const genus       = species.genera?.find((g) => g.language.name === 'en')?.genus ?? '';
  const ability     = pokemon.abilities[0]?.ability.name ?? '';
  const totalStats  = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const eggGroups   = species.egg_groups.map((g) => captalizar(g.name)).join(', ');
  const captureRate = `${species.capture_rate} (${((species.capture_rate / 255) * 100).toFixed(1)}%)`;

  const sprites = [
    { src: pokemon.sprites.front_default,  label: 'Front default' },
    { src: pokemon.sprites.front_shiny,    label: 'Front shiny'   },
    { src: pokemon.sprites.back_default,   label: 'Back default'  },
    { src: pokemon.sprites.back_shiny,     label: 'Back shiny'    },
  ].filter((s) => s.src);

  return (
    <>
      <Navbar rightContent={backBtn} />
      <div className={styles.pageContainer}>

        {/* ─── Hero card ─── */}
        <div className={styles.heroCard}>
          <div className={styles.heroImageBox}>
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className={styles.heroImage}
            />
          </div>

          <div className={styles.heroInfo}>
            <span className={styles.heroId}>#{String(pokemon.id).padStart(4, '0')}</span>
            <h1 className={styles.heroName}>{captalizar(pokemon.name.split('-')[0])}</h1>

            <div className={styles.typeBadges}>
              {pokemon.types.map((t) => (
                <span
                  key={t.type.name}
                  className={styles.typeBadge}
                  style={{ backgroundColor: typeColors[t.type.name] ?? '#A8A878' }}
                >
                  {t.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            <div className={styles.flavorBox}>
              {flavorTexts.map((txt, i) => (
                <p key={i} className={styles.flavorText}>{txt}</p>
              ))}
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Altura</span>
                <span className={styles.metaValue}>{(pokemon.height / 10).toFixed(1)}m</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Peso</span>
                <span className={styles.metaValue}>{(pokemon.weight / 10).toFixed(1)}kg</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Categoria</span>
                <span className={styles.metaValue}>{genus}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  Habilidade&nbsp;
                  <Icon icon="mdi:information-outline" width="13" height="13" style={{ verticalAlign: 'middle' }} />
                </span>
                <span className={styles.metaValue}>{captalizar(ability)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Status + Informações ─── */}
        <div className={styles.twoCol}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Icon icon="mdi:chart-bar" width="18" height="18" color="#E63946" />
              <span className={styles.sectionTitle}>Status</span>
            </div>
            <div className={styles.statsList}>
              {pokemon.stats.map((s) => (
                <div key={s.stat.name} className={styles.statRow}>
                  <span className={styles.statLabel}>{statLabels[s.stat.name] ?? s.stat.name}</span>
                  <div className={styles.barBg}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(s.base_stat / 255) * 100}%`,
                        backgroundColor: getStatColor(s.base_stat),
                      }}
                    />
                  </div>
                  <span className={styles.statNum}>{s.base_stat}</span>
                </div>
              ))}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>{totalStats}</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Icon icon="mdi:information-outline" width="18" height="18" color="#E63946" />
              <span className={styles.sectionTitle}>Informações</span>
            </div>
            <div className={styles.infoTable}>
              {[
                ['ID:', String(pokemon.id).padStart(4, '0')],
                ['Geração',         String(romanToNumber(species.generation.name))],
                ['Grupo de ovo',    eggGroups],
                ['Taxa de captura', captureRate],
                ['Amizade base',    String(species.base_happiness)],
                ['Taxa de crescimento', formatGrowthRate(species.growth_rate.name)],
                ['EXP base',        String(pokemon.base_experience)],
              ].map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{label}</span>
                  <span className={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Icon icon="mdi:pokeball" width="18" height="18" color="#E63946" />
              <span className={styles.sectionTitle}>Evoluções</span>
            </div>
            <div className={styles.evoChain}>
              {evoChain.map((evo, idx) => (
                <div key={evo.id} className={styles.evoEntry}>
                  {idx > 0 && (
                    <div className={styles.evoArrow}>
                      {evo.level && (
                        <span className={styles.evoLevel}>Nível {evo.level}</span>
                      )}
                      <Icon icon="mdi:arrow-right" width="20" height="20" color="var(--textColor)" />
                    </div>
                  )}
                  <div
                    className={`${styles.evoCard} ${evo.id === pokemon.id ? styles.evoCardActive : ''}`}
                    onClick={() => router.push(`/pokemon/${evo.id}`)}
                  >
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                      alt={evo.name}
                      className={styles.evoImage}
                    />
                    <span className={styles.evoName}>{captalizar(evo.name)}</span>
                    <div className={styles.evoBadges}>
                      {evo.types.map((t) => (
                        <span
                          key={t}
                          className={styles.typeBadgeSmall}
                          style={{ backgroundColor: typeColors[t] ?? '#A8A878' }}
                        >
                          {t.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionHeaderSpaced}>
              <div className={styles.sectionHeader}>
                <Icon icon="mdi:sword" width="18" height="18" color="#E63946" />
                <span className={styles.sectionTitle}>Movimentos aprendidos</span>
              </div>
            </div>
            <div className={styles.movesList}>
              {moves.map((move) => (
                <div key={move.name} className={styles.moveRow}>
                  <span className={styles.moveName}>{move.name}</span>
                  <span
                    className={styles.moveBadge}
                    style={{ backgroundColor: typeColors[move.type] ?? '#A8A878' }}
                  >
                    {move.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>


        <div className={styles.singleCard}>
          <div className={styles.sectionHeader}>
            <Icon icon="mdi:image-outline" width="18" height="18" color="#E63946" />
            <span className={styles.sectionTitle}>Sprites</span>
          </div>
          <div className={styles.spritesRow}>
            {sprites.map((s) => (
              <div key={s.label} className={styles.spriteItem}>
                <img src={s.src} alt={s.label} className={styles.spriteImg} />
                <span className={styles.spriteLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
