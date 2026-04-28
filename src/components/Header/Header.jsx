import { Heading, Button } from '@aws-amplify/ui-react';
import './style.scss'

export default function Header({ children, signOut }) {
  return (
    <header className="header">
      <Heading level={1}>What is in your fridge?</Heading>
      <Button onClick={signOut}>Sign Out</Button>
    </header>
  )
}