describe('click top bar as student', () => {





  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test http://localhost:3000/vocabulary
    cy.visit('http://localhost:3000/login')
    cy.get('input.w-full').eq(0).type('gust5@gmail.com{enter}')
    cy.get('input.w-full').eq(1).type('123456{enter}')

  })

  it('add vocab)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')
    cy.get('a.flex').eq(12).click()

    cy.get('select').eq(0).select('apple - apple')
    cy.get('select').eq(1).select('apple')
    cy.get('input').eq(0).type('apple test')
    cy.get('input').eq(1).type('apple test')
    cy.get('textarea').eq(0).type('apple test')



    cy.get('button.font-bold').eq(1).click()

    //cy.contains('test').click()    // กดตัวเลือกที่โผล่มา
    //cy.get('div.mb-8 form input').type('OOtest{enter}')

    //cy.contains('test').should('exist')

  })

  it('del vocab)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('a.flex').eq(9).click()
    cy.get('input').eq(0).type('apple')
    cy.get('button.flex').eq(3).click()
    cy.get('button.font-bold').eq(2).click()

    cy.on('window:confirm', () => true)
    cy.wait(3000)
    //cy.get('button').eq(3).click()
  })

  it('add course)', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')
    cy.get('a.flex').eq(13).click()
    cy.get('input').eq(0).type('AA')
    cy.get('input').eq(1).type('AA')
    cy.get('select').eq(0).select('เฉพาะผู้ดูแล (admin เท่านั้น)')


    cy.get('textarea').eq(0).type('AA')
    cy.get('button').eq(3).click()

  })

  it('del course', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('a.flex').eq(8).click()
    cy.get('input').eq(0).type('AA')
    cy.get('span').eq(14).click()
    cy.get('button').eq(3).click()


    cy.on('window:confirm', () => true)
    cy.wait(3000)

  })
  it('เข้าหน้ารวมreportได้+ไปหน้าเเก้ไข+ลบได้+กดเลือกได้', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')

    cy.get('a.flex').eq(10).click()

    cy.get('a.cursor-pointer').eq(0).click()
    cy.wait(3000)
    cy.go('back')
    cy.wait(3000)

    cy.get('input').eq(1).click()
    cy.get('button').eq(2).click()
    cy.get('button').eq(2).click()

    cy.get('input').eq(0).click()
    cy.get('input').eq(0).click()

    cy.get('button').eq(2).click()
    cy.get('button').eq(2).click()




  })
  it('เข้าหน้าจัดการผู้ใช้ได้+ไปเเก้ไขrole+ลบuserได้', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')


    cy.get('a.flex').eq(11).click()
    cy.get('input').eq(0).type('gust')
    cy.get('select').eq(0).select('ADMIN').wait(3000)
    cy.get('select').eq(0).select('STUDENT')

    cy.get('button').eq(9).click().wait(1000)
    cy.get('button').eq(12).click().wait(1000)
  })
  it('เข้าหน้าสื่อ+ดูค่า+ค้นหา+เลือก+ลบ', () => {
    cy.get('a.flex').eq(12).click().wait(1000)
    cy.get('p.text-2xl').eq(0).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนภาพ: ' + text)
        })

    cy.get('p.text-2xl').eq(1).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนVDO: ' + text)
        })

    cy.get('p.text-2xl').eq(2).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('ขนาดไฟล์รวม: ' + text + 'MB ')
        })
    cy.get('p.text-2xl').eq(3).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนสื่อที่ไม่ได้ใช้: ' + text)
        })
    cy.get('input').eq(1).click().wait(1000)//select all
    cy.get('input').eq(1).click().wait(1000)

    cy.get('input').eq(2).click().wait(1000)//select 1
    cy.get('input').eq(2).click().wait(1000)

    cy.get('button.text-red-500').eq(0).click()
    cy.get('button.text-gray-600').eq(1).click()

    cy.get('button.text-indigo-600').eq(0).click()

  })
  it('เข้าหน้าสถิติ+ดูค่า+ค้นหา+filter+เลือก+ลบ', () => {
    // cy.get('div.mb-8 form').click().type('test{enter}')
    cy.get('a.flex').eq(13).click()
    cy.get('p.text-3xl').eq(0).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนวิชา: ' + text)
        })

    cy.get('p.text-3xl').eq(1).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนวศัพ?์: ' + text)
        })

    cy.get('p.text-3xl').eq(2).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนววิว: ' + text)
        })
    cy.get('p.text-3xl').eq(3).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนวปักหมุด: ' + text)
        })
    cy.get('p.text-3xl').eq(4).wait(1000)
        .should('exist')        // แค่มี element ก็ผ่าน
        .invoke('text')         // ดึง text ออกมา
        .then((text) => {
          cy.log('จำนวนวคำโปรด: ' + text)
        })

    cy.get('input').eq(0).type('apple')
    cy.get('select').eq(0).select('นักศึกษา').wait(3000)
    cy.get('select').eq(0).select('ผู้ดูแลระบบ').wait(3000)
  })











})