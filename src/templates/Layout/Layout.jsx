import './style.scss'
import Section from '../Section/Section.jsx'
import Header from './../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'

export default function Layout({ children, signOut }) {
  return (
    <main className="layout">
      <Section>
        <Header signOut={signOut} />
      </Section>
      <Section className="content">
        {children}
      </Section>
      <Section>
        <Footer />
      </Section>
    </main>
  )
}