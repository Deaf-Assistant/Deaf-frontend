describe('click top bar as anonymous', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test

    cy.visit('http://localhost:3000/courses')
  })

  it('click search and search(type collectly)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('test{enter}')

    cy.contains('test').should('exist')

  })

  it('click search and search(type collectly ไม่ควรพบสิ่งที่ไม่ได้ค้นหา)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('test{enter}')

    cy.contains('compro').should('not.exist')

  })

  it('click search and search(type collectly but Uppercase)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('TEST{enter}')

    cy.contains('test').should('exist')

  })

  it('click search and search(unfinish type [te])', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('div.mb-8 form input').type('te{enter}')

    cy.contains('test').should('exist')

  })



  it('click รายระเอียดวิชาเข้าวิชาได้', () => {

    cy.url().then((oldUrl) => {

      cy.get('div.text-blue-600 span.text-base')
          .eq(0)
          .click()

      cy.url().should('not.eq', oldUrl)

    })

  })




})