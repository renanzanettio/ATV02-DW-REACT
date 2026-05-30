import styles from './Navbar.module.css';
import Image from 'next/image';
import Logo from '@/../public/premier-ball.png';

const Navbar = ({ rightContent }) => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Image src={Logo} alt="Premier Ball" className={styles.logoImage} />
                <span className={styles.logoText}>Trainer<span style={{ color: '#E63946' }}>Dex</span></span>
            </div>
            {rightContent && (
                <div className={styles.rightContent}>
                    {rightContent}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
