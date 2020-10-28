import { ReactNode, memo } from "react";

import styles from './Card.module.css';

const Card = memo(({ children }: { children: ReactNode }) => {
    return <div className={styles['card']}>{children}</div>;
});

const CardBody = memo(({ children }: { children: ReactNode }) => {
    return <div className={styles['card-body']}>{children}</div>;
});

export default Card;
export { CardBody };
