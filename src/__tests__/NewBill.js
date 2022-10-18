/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {
  getByTestId,
} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then should see form NewBill ", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const form = screen.getByTestId('form-new-bill')
      expect(form).toBeDefined
      const amount = screen.getByTestId('amount')
      expect(amount).toBeDefined
      const date = screen.getByTestId('datepicker')
      expect(date).toHaveClass('blue-border')
    })

    describe('When I click on submit', () => {
      test("Then should return on billed list page", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'employee'
        }))
        const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const type = screen.getByTestId('expense-type')
        userEvent.selectOptions(type, screen.getAllByText('Transports'))
        expect(type.value).toBe('Transports')
        
        const name = screen.getByTestId('expense-name')
        userEvent.type(name, 'Vol')
        expect(name.value).toBe('Vol')
        
        const date = screen.getByTestId('datepicker')
        fireEvent.change(date, { target: { value: "2020-01-02" } });
        expect(date.value).toBe('2020-01-02')

        const price = screen.getByTestId('amount')
        userEvent.type(price, '300')
        expect(price.value).toBe('300')
        
        const tax = screen.getByTestId('pct')
        userEvent.type(tax, '20')
        expect(tax.value).toBe('20')

        const file = new File(
          ["myImage"], 
          "myImage.png", 
          {type: 'image/png'}
        )

        const inputFile = screen.getByTestId("file")
        fireEvent.change(inputFile, {target: {files: [file]}})

        const commentary = screen.getByTestId("commentary")
        userEvent.type(commentary, 'Un commentaire')
        expect(commentary.value).toBe('Un commentaire')
 
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const submit = screen.getByTestId('form-new-bill')
        expect(submit).toBeDefined
        submit.addEventListener("submit", handleSubmit)
        fireEvent.submit(submit)
        expect(handleSubmit).toHaveBeenCalled()

        const heading = screen.getByText('Mes notes de frais')
        expect(heading).toBeDefined
      })
    })
  })

  describe("When user select a file with good extention", () => {
    test("Then file should be saved", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html 

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))
      const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)

      const file = new File(
        ["myImage"], 
        "myImage.png", 
        {type: 'image/png'}
      )
      const error = screen.getByTestId("error")
      fireEvent.change(inputFile, {target: {files: [file]}})
      await handleChangeFile
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0]).toEqual(file)
      expect(error).toHaveAttribute("hidden")
    })
  })

  describe("When user select a file with good extention", () => {
    test("Then error message should be visible", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html 

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))
      const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)

      const file = new File(
        ["myImage"], 
        "myImage.mp3", 
        {type: 'image/mp3'}
      )
      const error = screen.getByTestId("error")
      fireEvent.change(inputFile, {target: {files: [file]}})
      await handleChangeFile
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0]).toEqual(file)
      expect(error).not.toHaveAttribute("hidden")
    })
  })
  })

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Create new file bill from mock API", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
        }
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))

      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)

      const file = new File(
        ["myImage"], 
        "myImage.png", 
        {type: 'image/png'}
      )
      fireEvent.change(inputFile, {target: {files: [file]}})
      await handleChangeFile
      expect(handleChangeFile).toHaveBeenCalled()
      expect(newBill.fileUrl).toEqual('https://localhost:3456/images/test.jpg')
      expect(newBill.billId).toEqual('1234')
      })
    })
  })