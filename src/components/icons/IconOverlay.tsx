import styles from './IconSetting.module.css';

export function IconOverlay() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.settingIcon}
    >
      <title>Slide Overlay</title>
      <path
        d="M7 25H28M28 30C28 30.553 27.553 31 27 31H5C4.447 31 4 30.553 4 30V2C4 1.447 4.447 1 5 1H27C27.553 1 28 1.447 28 2V30Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
