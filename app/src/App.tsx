import React from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import {
  Program, AnchorProvider, web3
} from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './idl.json';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const { SystemProgram, Keypair } = web3;

const baseAccount = Keypair.generate();
const programID = new PublicKey(idl.metadata.address);
const commitment = 'processed'
const preflightCommitment = 'processed'
const stringifyIdl = JSON.stringify(idl)
const JSONIdl = JSON.parse(stringifyIdl)

function App() {
  const [value, setValue] = React.useState(null);

  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();

  async function getProvider() {
    const connection = new Connection('http://127.0.0.1:8899', commitment)

    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }
    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signerWallet, { preflightCommitment, commitment })
    
    return provider;
  }

  async function createCounter() {
    const provider = await getProvider()

    const program = new Program(JSONIdl, programID, provider);

    if (! provider) return

    try {
      await program.methods.create().accounts({
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([baseAccount])
      .rpc()

      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      setValue(account.count.toString());
    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function increment() {
    const provider = await getProvider();
    const program = new Program(JSONIdl, programID, provider);
    await program.methods.increment().accounts({
      baseAccount: baseAccount.publicKey
    }).rpc()

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    setValue(account.count.toString());
  }

  async function decrement() {
    const provider = await getProvider();
    const program = new Program(JSONIdl, programID, provider);
    await program.methods.decrement().accounts({
      baseAccount: baseAccount.publicKey
    }).rpc()

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    setValue(account.count.toString());
  }


  return (
      <div className="App">
        <div>
            {
              !wallet 
              ? <p> Click button to connext wallet </p> 
              : 
              <div>
                {
                  !value && (<button onClick={createCounter}>Create counter</button>)
                }
                {
                  value && <button onClick={increment}>Increment counter</button>
                }
                {
                  value && <button onClick={decrement}>Decrement counter</button>
                }

                {
                  value && value >= Number(0) ? (
                    <h2>{value}</h2>
                  ) : (
                    <h3>Please create the counter.</h3>
                  )
                }
              </div>
            }
            
          </div>
      </div>
  );
}

function AppProvider() {

  const wallets = React.useMemo(
    () => [
        new PhantomWalletAdapter(),
    ],
    []
  );

  return (
      <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
              <WalletMultiButton />
              <App />
          </WalletModalProvider>
      </WalletProvider>
  );
}

export default AppProvider;