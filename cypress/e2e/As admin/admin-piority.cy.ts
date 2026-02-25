describe('click top bar as student', () => {



  after(()=>{
    cy.get('button.top-3').eq(0).click()



  })

  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test http://localhost:3000/vocabulary
    cy.visit('http://localhost:3000/login')
    cy.get('input.w-full').eq(0).type('gust@gmail.com{enter}')
    cy.get('input.w-full').eq(1).type('123456{enter}')

  })

  it('add vocab)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')
    cy.get('a.flex').eq(12).click()
    cy.get('div.mb-8 form input').type('test{enter}')

    cy.contains('test').should('exist')

  })

  it('del vocab)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('test{enter}')

    cy.contains('compro').should('not.exist')

  })

  it('add course)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('TEST{enter}')

    cy.contains('test').should('exist')

  })

  it('del course', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('te{enter}')

    cy.contains('test').should('exist')

  })











})