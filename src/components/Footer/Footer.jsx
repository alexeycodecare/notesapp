import { Text } from '@aws-amplify/ui-react';
import './style.scss'

export default function Footer({ children }) {
  return (
    <footer className="footer">
      <Text>Amplify Gen 2 + Bedrock recipe assistant</Text>
    </footer>
  )
}
