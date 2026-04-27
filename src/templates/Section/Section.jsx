import './style.scss'

export default function Section({ children, className }) {
  return (
    <section className={`section ${className}`}>
      <div className='container'>
        {children}
      </div>
    </section>
  )
}