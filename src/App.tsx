import croiseur from './assets/ships/croiseur-min.jpg'
import './App.css'
import { Alert } from '@chakra-ui/react'

function App() {
  return (
    <main className="main">
      <div className="description">
        <p>
          Pour commencer à coder, rendez-vous ici:&nbsp;
          <code className="code">src/App.tsx</code>
        </p>
      </div>

      <div className="center">
        <img
          className="logo"
          src={croiseur}
          alt="Croiseur"
          width={246}
          height={74}
        />
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Bienvenue sur le frontend</Alert.Title>
            <Alert.Description>
              Ici, tu vas pouvoir développer une interface.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </div>

      <div className="grid">
        <a
          href="https://react.dev"
          className="card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs React<span>-&gt;</span>
          </h2>
          <p>
            Retrouve toute la documentation officielle de React.
          </p>
        </a>

        <a
          href="https://reactrouter.com/start/declarative/routing"
          className="card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Routage <span>-&gt;</span>
          </h2>
          <p>
            Documentation officielle de React Router
          </p>
        </a>
      </div>
    </main>
  )
}

export default App
