describe('click top bar as anonymous', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('http://localhost:3000/login')
    })

    it('user name&pass correct', () => {
        // cy.get('div.mb-8 form').click().type('test{enter}')
        cy.url().then((oldUrl) => {
            cy.get('input.w-full').eq(0).type('gust@gmail.com{enter}')
            cy.get('input.w-full').eq(1).type('123456{enter}')

            cy.url().should('not.eq', oldUrl)

        })
    })

    it('user name correct but wrong pass correct', () => {
        // cy.get('div.mb-8 form').click().type('test{enter}')
        cy.url().then((oldUrl) => {
            cy.get('input.w-full').eq(0).type('gust@gmail.com{enter}')
            cy.get('input.w-full').eq(1).type('thewrongpass{enter}')

            cy.url().should('eq', oldUrl)

        })
    })

    it('user wrong name  but correct pass ', () => {
        // cy.get('div.mb-8 form').click().type('test{enter}')
        cy.url().then((oldUrl) => {
            cy.get('input.w-full').eq(0).type('wrong@gmail.com{enter}')
            cy.get('input.w-full').eq(1).type('123456{enter}')

            cy.url().should('eq', oldUrl)

        })
    })
})