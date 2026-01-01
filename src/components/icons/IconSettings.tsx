import styles from './IconSettings.module.css';

export function IconSettings() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.settingsIcon}
    >
      <title>Slideshow Settings</title>
      <g clipPath="url(#clip0_901_1498)">
        <path
          d="M23 22C23 20.343 21.657 19 20 19C18.343 19 17 20.343 17 22C17 23.657 18.343 25 20 25C21.657 25 23 23.657 23 22ZM23 22H25M14 22H7M17 10C17 11.657 15.657 13 14 13C12.343 13 11 11.657 11 10C11 8.343 12.343 7 14 7C15.657 7 17 8.343 17 10ZM17 10H25M7 10H8M31 30C31 30.553 30.553 31 30 31H2C1.447 31 1 30.553 1 30V2C1 1.447 1.447 1 2 1H30C30.553 1 31 1.447 31 2V30Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_901_1498">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
