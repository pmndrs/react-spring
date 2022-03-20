import { Header } from '~/components/Header/Header'
import { HeroHome } from '~/components/Hero/HeroHome'

export default function Index() {
  return (
    <>
      <Header
        transparentBackground
        addMarginToMain={false}
        position="fixed"
        alwaysAnimateHeader
      />
      <main>
        <article>
          <HeroHome />
          <section style={{ height: '100vh' }}>
            <h2>react-spring</h2>
            <p>
              With naturally fluid animations you will elevate your UI &
              interactions. Bringing your apps to life has never been simpler.
            </p>
          </section>
        </article>
      </main>
    </>
  )
}
