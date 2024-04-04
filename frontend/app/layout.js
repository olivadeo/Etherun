'use client'

import RainbowKitAndChakraProvider from './RainbowKitAndChakraProvider';
import Layout from '@/components/Layout';
import { EtherunContextProvider } from './context/EtherunContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RainbowKitAndChakraProvider >
          <EtherunContextProvider>
            <Layout>
              {children}
            </Layout>
          </EtherunContextProvider>
        </RainbowKitAndChakraProvider>

      </body>
    </html>
  );
}
