
describe('click top bar as student', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('http://localhost:3000/login')
    cy.get('input.w-full').eq(0).type('gust5@gmail.com{enter}')
    cy.get('input.w-full').eq(1).type('123456{enter}')


  })

  it('click home', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.url().should('include', '')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click course', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(1).click()
    cy.url().should('include', '/course')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click vocabulary', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(2).click()
    cy.url().should('include', '/vocabulary')
    //cy.get('h1').should('contain', 'Assistant')

  })



  it('click เริ่มใช้งาน', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.get('button.btn-primary').eq(0).click()
    cy.url().should('include', '/course')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click ค้นหา', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.get('button.btn-primary').eq(1).click()
    cy.url().should('include', '/vocabulary')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click ทดสอบความรู้', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.get('button.btn-primary').eq(2).click()
    cy.url().should('include', '/quiz')
    //cy.get('h1').should('contain', 'Assistant')

  })

  it('click login', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.get('button.inline-flex').eq(3).click()
    cy.url().should('include', '/register')
  })

  it('click register', () => {
    cy.get('button.p-2').eq(0).click()
    cy.get('a.px-4').eq(0).click()
    cy.get('button.inline-flex').eq(4).click()
    cy.url().should('include', '/login')
  })
})