import React from "react";
import styles from "./Header.module.css";

const Header = ({ onUserChange, currentUser }) => {
    const handleKenClick = () => {
        onUserChange({ id: "ken", name: "Ken" });
    };

    const handleJulieClick = () => {
        onUserChange({ id: "julie", name: "Julie" });
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoDiv}>
                <h1 className={styles.logo}>
                    <span className={styles.highlight}>J</span>ulie
                    <span className={styles.highlight}>K</span>en
                </h1>
            </div>

            <div className={styles.navContainer}>
                <nav className={styles.nav}>
                    <ul>
                        <li className={styles.navItem}>
                            <button type="button" className={currentUser?.id === "julie" ? styles.active : styles.inactive} onClick={handleJulieClick}>
                                <span className={styles.label}>Julie</span>
                            </button>
                        </li>
                        <li className={styles.navItem}>
                            <button type="button" className={currentUser?.id === "ken" ? styles.active : styles.inactive} onClick={handleKenClick}>
                                <span className={styles.label}>Ken</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
