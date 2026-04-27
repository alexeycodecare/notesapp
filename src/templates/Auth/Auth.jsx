import {
  Authenticator,
  Button,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import AppChat from '../../components/AppChat/AppChat.jsx';
import RecipeGenerator from '../../components/RecipeGenerator/RecipeGenerator.jsx';
import Layout from '../Layout/Layout.jsx';
import './style.scss'

export default function Auth() {

  return (
    <div className="auth-wrapper">
      <Authenticator>
        {({ signOut }) => (
          <Layout>
            <>
              <RecipeGenerator />
              <AppChat />
              <Button onClick={signOut}>Sign Out</Button>
            </>
          </Layout>
        )}
      </Authenticator>
    </div>
  )

}