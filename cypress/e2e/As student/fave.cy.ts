describe('core after s1', () => {//something wrong fav
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')

    cy.get('input.w-full').eq(0).type('gust@gmail.com')
    cy.get('input.w-full').eq(1).type('123456')

    cy.get('button[type=submit]').click()


    cy.url().should('not.include', '/login')
  })



  it('fav can add and can found', () => {
    cy.visit('http://localhost:3000/vocabulary/8654b8b0-07d1-42b1-bbbd-0e1f90e2c6f8')

    cy.get('button.rounded-full').click()

    cy.get('a.flex').eq(4).click()

    cy.contains('test').should('exist')


  })

  it('fav can remove it', () => {
    cy.visit('http://localhost:3000/vocabulary/8654b8b0-07d1-42b1-bbbd-0e1f90e2c6f8')


    cy.get('button.rounded-full').click()
    cy.get('a.flex').eq(4).click()
    cy.contains('test').should('not.exist')

  })
  // cy.get('div.mb-8 form').click().type('test{enter}')






})