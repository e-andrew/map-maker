'use client';

import styles from "./page.module.css";
import { leave } from "@/socket.js";
import React from "react";
import Map from '@/components/map-component.js';
import Chat from "@/components/chat-component.js";
import { useRouter } from 'next/navigation';

export default function Creator() {
    const router = useRouter();

    const leaveOnClick = (event) => {
        event.preventDefault();
        leave();
        router.push('/');
    }

    return (
        <div className={styles.creator}>
            <button className={styles.button} onClick={leaveOnClick}>Leave</button>
            <Map />
            <Chat />
        </div>
    );
}
