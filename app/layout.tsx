import type {Metadata,Viewport} from 'next';
import './globals.css';
import './retro.css';
import './home-scene.css';
import {RetroComputerFrame} from '@/components/computer-frame';
import {App} from '@/components/app';
import {Provider} from '@/components/provider';
export const metadata:Metadata={title:'Gamify.Life — A little better, every adventure',description:'Your hobbies, a little more intentional. Learn, practice and grow in a cozy personal skill-tree desktop.',manifest:'/manifest.webmanifest'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#D8CDBB'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Provider><RetroComputerFrame><App/>{children}</RetroComputerFrame></Provider></body></html>;}
