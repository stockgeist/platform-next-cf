import type { Config } from 'tailwindcss'
import { heroui } from '@heroui/react'
import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'

// TODO: Upgrade to Tailwind V4 and move all of this to global.css
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [typography, animate, heroui()],
}
export default config
