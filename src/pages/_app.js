import "@/styles/globals.css";

import {
  Montserrat,
  Jersey_10,
  Jersey_25,
} from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const jersey10 = Jersey_10({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jersey10',
})

const jersey25 = Jersey_25({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jersey25',
})

export default function App({ Component, pageProps }) {
  return (
    <main
      className={`
        ${montserrat.variable}
        ${jersey10.variable}
        ${jersey25.variable}
      `}
    >
      <Component {...pageProps} />
    </main>
  )
}