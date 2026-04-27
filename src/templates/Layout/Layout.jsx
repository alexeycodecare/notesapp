import './style.scss'
import Section from '../Section/Section.jsx'
import Header from './../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'

export default function Layout({ children }) {
  return (
    <main className="layout">
      <Section>
        <Header />
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