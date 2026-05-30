import Logo from "../../public/premier-ball.png"
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Icon } from '@iconify/react'


export default function Home() {
  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.logoContainer}>
          <Image src={Logo} alt="Premier Ball" width={200} height={200} />
          <label className={styles.subtitle}>OVERLAY PARA STREAMERS</label>
          <h1 className={styles.title}>Trainer <span className={styles.highlight}>Dex</span></h1>
        </div>
        <label className={styles.description}>Acompanhe sua pokédex, monte seu time e exiba tudo como overlay na sua live no OBS.</label>
      
        <div className={styles.rowCard}>
          <div className={styles.card}>
            <Icon icon="mdi:pokeball" width="32" height="32" color="#E63946" />
            <div>
              <label className={styles.cardTitle}>POKEDEX COMPLETA</label>
              <p className={styles.cardDescription}>Todos os dados atualizados</p>
            </div>
          </div>
          
          <div className={styles.card}>
            <Icon icon="boxicons:thunder" width="32" height="32" color="#E63946" />
            <div>
              <label className={styles.cardTitle}>LEVE E RÁPIDO</label>
              <p className={styles.cardDescription}>Desempenho otimizado</p>
            </div>
          </div>
        </div>
        <a href="/Trainerdex">
          <div className={styles.buttonContainer}>
            Entrar
          </div>
        </a>
      </div>
    </>
  )
}
