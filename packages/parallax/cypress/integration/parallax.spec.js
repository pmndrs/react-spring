describe('Parallax - vertical', () => {
  const HEIGHT = Cypress.config('viewportHeight')

  beforeEach(() => {
    cy.visit('/vertical')
  })

  it('should translate layers as expected', () => {
    // intial snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // initial layer positions
    cy.findByTestId('default-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, ${HEIGHT * 2}px, 0px)`)
      )

    cy.findByTestId('opposite-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(${HEIGHT * 2}px, 0px, 0px)`)
      )

    cy.findByTestId('sticky-layer')
      .should('have.css', 'position', 'absolute')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, ${HEIGHT}px, 0px)`)
      )

    // scroll to next page
    cy.findByTestId('container').scrollTo(0, HEIGHT)
    // wait for animation to finish
    cy.wait(2000)

    // halfway snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // halfway layer positions
    cy.findByTestId('default-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, ${HEIGHT}px, 0px)`)
      )

    cy.findByTestId('opposite-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(${HEIGHT}px, 0px, 0px)`)
      )

    cy.findByTestId('sticky-layer')
      .should('have.css', 'position', 'sticky')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, 0px, 0px)`)
      )

    // scroll to last page
    cy.findByTestId('container').scrollTo('bottom')
    // wait for animation again
    cy.wait(2000)

    // final snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // final layer positions
    cy.findAllByTestId(/-layer/).each(layer =>
      expect(layer[0].style.transform).to.equal('translate3d(0px, 0px, 0px)')
    )

    cy.findByTestId('sticky-layer').should('have.css', 'position', 'sticky')
  })

  it('should scroll to the correct page with scrollTo', () => {
    cy.findByRole('button').click()

    cy.findByTestId('container').invoke('scrollTop').should('equal', HEIGHT)
  })
})

describe('Parallax - horizontal', () => {
  const WIDTH = Cypress.config('viewportWidth')

  beforeEach(() => {
    cy.visit('/horizontal')
  })

  it('should translate layers as expected', () => {
    // intial snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // initial layer positions
    cy.findByTestId('default-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(${WIDTH * 2}px, 0px, 0px)`)
      )

    cy.findByTestId('opposite-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, ${WIDTH * 2}px, 0px)`)
      )

    cy.findByTestId('sticky-layer')
      .should('have.css', 'position', 'absolute')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(${WIDTH}px, 0px, 0px)`)
      )

    // scroll to next page
    cy.findByTestId('container').scrollTo(WIDTH, 0)
    // wait for animation to finish
    cy.wait(2000)

    // halfway snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // halfway layer positions
    cy.findByTestId('default-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(${WIDTH}px, 0px, 0px)`)
      )

    cy.findByTestId('opposite-layer')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, ${WIDTH}px, 0px)`)
      )

    cy.findByTestId('sticky-layer')
      .should('have.css', 'position', 'sticky')
      .then(layer => layer[0].style.transform)
      .then(transform =>
        expect(transform).to.equal(`translate3d(0px, 0px, 0px)`)
      )

    // a possible bug in cypress causes this to fail with `yarn cypress` (`cypress open`)
    // but will pass with `yarn test` (`cypress run`)
    cy.findByTestId('container').scrollTo('right')
    // wait for animation again
    cy.wait(2000)

    // final snapshot
    cy.findByTestId('container').toMatchSnapshot()

    // final layer positions
    cy.findAllByTestId(/-layer/).each(layer =>
      expect(layer[0].style.transform).to.equal('translate3d(0px, 0px, 0px)')
    )

    cy.findByTestId('sticky-layer').should('have.css', 'position', 'sticky')
  })

  it('should scroll to the correct page with scrollTo', () => {
    cy.findByRole('button').click()

    cy.findByTestId('container').invoke('scrollLeft').should('equal', WIDTH)
  })
})
