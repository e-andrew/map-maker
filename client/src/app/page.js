'use client';

import styles from "./page.module.css";
import { join } from "@/socket.js";
import React from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  const joinOnSubmit = (event) => {
    event.preventDefault();
    const host = document.getElementById('host').value;
    const port = document.getElementById('port').value;
    join(host, port);
    router.push('/creator');
  }

  return (
    <form className={styles.form} id="form" onSubmit={joinOnSubmit}>
      <input className={styles.input} type="text" placeholder="Host" id="host"/>
      <input className={styles.input} type="text" placeholder="Port" id="port"/>
      <button className={styles.button}>Join</button>
    </form>
  );
}