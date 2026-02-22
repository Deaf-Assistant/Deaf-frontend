
describe('click top bar as anonymous', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:3000')
  })

  it('click home', () => {
    cy.get('nav.hidden a.flex').eq(0).click()
    cy.url().should('include', '')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click course', () => {
    cy.get('nav.hidden a.flex').eq(1).click()
    cy.url().should('include', '/course')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click vocabulary', () => {
    cy.get('nav.hidden a.flex').eq(2).click()
    cy.url().should('include', '/vocabulary')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click login', () => {
    cy.get('div.flex button.flex').eq(0).click()
    cy.url().should('include', '/login')
  })

  it('click register', () => {
    cy.get('div.flex button.flex').eq(1).click()
    cy.url().should('include', '/register')
  })

  it('click เริ่มใช้งาน', () => {
    cy.get('div.flex button.flex').eq(2).click()
    cy.url().should('include', '/course')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click ค้นหา', () => {
    cy.get('div.flex button.flex').eq(3).click()
    cy.url().should('include', '/vocabulary')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click ทดสอบความรู้', () => {
    cy.get('div.flex button.flex').eq(4).click()
    cy.url().should('include', '/quiz')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click login2', () => {
    cy.get('div.flex button.flex').eq(5).click()
    cy.url().should('include', '/register')
  })

  it('click register2', () => {
    cy.get('div.flex button.flex').eq(6).click()
    cy.url().should('include', '/login')
  })
})