import Image from "next/image";
import styles from "../page.module.css";

// Identity cluster (avatar · name · role) used as the header logo.
export default function Brand() {
  return (
    <>
      <span className={styles.logoAvatar} aria-hidden="true">
        <Image
          src="/robertt.png"
          alt=""
          width={42}
          height={42}
          className={styles.logoAvatarImg}
        />
      </span>
      <span className={styles.logoText}>
        <span className={styles.logoName}>Roman Robert</span>
        <span className={styles.logoRole}>Frontend Developer</span>
      </span>
    </>
  );
}
