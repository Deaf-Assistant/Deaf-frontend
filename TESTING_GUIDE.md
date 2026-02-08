# คู่มือการทดสอบโปรเจค 

## 📚 สารบัญ

1. [ภาพรวมระบบการทดสอบ](#ภาพรวมระบบการทดสอบ)
2. [เครื่องมือที่ใช้](#เครื่องมือที่ใช้)
3. [โครงสร้างและการตั้งค่า](#โครงสร้างและการตั้งค่า)
4. [ประเภทของการทดสอบ](#ประเภทของการทดสอบ)
5. [แนวทางการเขียน Test](#แนวทางการเขียน-test)
6. [ตัวอย่างการทดสอบแบบละเอียด](#ตัวอย่างการทดสอบแบบละเอียด)
7. [คำสั่งที่ใช้บ่อย](#คำสั่งที่ใช้บ่อย)

---

## ภาพรวมระบบการทดสอบ

โปรเจคนี้ใช้ **Vitest** เป็น testing framework หลัก ซึ่งเป็น test runner ที่รวดเร็ว รองรับ TypeScript ทันที และออกแบบมาสำหรับ Vite ecosystem (ซึ่ง Next.js ก็ใช้ได้)

### เป้าหมายของการทดสอบ

- ✅ ตรวจสอบว่าฟีเจอร์ทำงานถูกต้อง (Correctness)
- ✅ ป้องกันบั๊กเกิดขึ้นใหม่เมื่อแก้โค้ด (Regression)
- ✅ เป็นเอกสารอธิบายว่าโค้ดควรทำงานอย่างไร (Documentation)
- ✅ สร้างความมั่นใจในการ refactor โค้ด (Confidence)

---

## เครื่องมือที่ใช้

### 1. **Vitest** (Core Testing Framework)

```json
"vitest": "^4.0.16"
```

- Test runner ที่รวดเร็ว รองรับ ESM, TypeScript
- มี API คล้าย Jest แต่เร็วกว่า
- Watch mode แบบ instant (hot reload)

### 2. **@testing-library/react** (React Testing Library)

```json
"@testing-library/react": "^16.1.0"
```

- เน้นทดสอบจากมุมมองของผู้ใช้ (User-centric testing)
- Query elements โดยใช้ accessibility attributes (role, label, text)
- ส่งเสริมการเขียน test ที่ไม่ขึ้นกับ implementation details

### 3. **@testing-library/jest-dom** (DOM Matchers)

```json
"@testing-library/jest-dom": "^6.6.3"
```

- เพิ่ม custom matchers สำหรับ DOM elements
- ตัวอย่าง: `toBeInTheDocument()`, `toHaveTextContent()`, `toHaveAttribute()`

### 4. **@testing-library/user-event** (User Interaction)

```json
"@testing-library/user-event": "^14.5.2"
```

- จำลองการกระทำของผู้ใช้ที่เหมือนจริง
- ตัวอย่าง: `user.click()`, `user.type()`, `user.upload()`
- ดีกว่า `fireEvent` เพราะจำลอง user interaction แบบครบวงจร

### 5. **jsdom** (Browser Environment)

```json
"jsdom": "^25.0.1"
```

- จำลอง browser environment ใน Node.js
- มี `window`, `document`, DOM APIs

### 6. **@vitest/ui** & **@vitest/coverage-v8** (DevTools)

```json
"@vitest/ui": "^4.0.16",
"@vitest/coverage-v8": "^4.0.16"
```

- UI dashboard สำหรับดู test results
- Code coverage reporting

---

## โครงสร้างและการตั้งค่า

### 1. **vitest.config.ts** - การตั้งค่าหลัก

```typescript
export default defineConfig({
  plugins: [react()], // รองรับ React JSX
  test: {
    environment: "jsdom", // ใช้ jsdom จำลอง browser
    globals: true, // ใช้ describe, it, expect แบบ global
    setupFiles: ["./vitest.setup.ts"], // ไฟล์ setup ก่อน run tests
    coverage: {
      provider: "v8", // V8 coverage (เร็วกว่า Istanbul)
      reporter: ["text", "json", "html"],
      exclude: [
        /* ... */
      ], // ไฟล์ที่ไม่ต้องวัด coverage
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"), // ใช้ @ แทน relative paths
    },
  },
});
```

### 2. **vitest.setup.ts** - การเตรียมพร้อมก่อนทดสอบ

```typescript
import "@testing-library/jest-dom/vitest"; // เพิ่ม DOM matchers

afterEach(() => {
  cleanup(); // ทำความสะอาด DOM หลังแต่ละ test
});

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock browser APIs ที่ jsdom ไม่มี
Object.defineProperty(window, "matchMedia", {
  /* ... */
});
global.IntersectionObserver = class IntersectionObserver {
  /* ... */
};
```

**ทำไมต้อง Mock?**

- Next.js hooks (`useRouter`, `usePathname`) ทำงานเฉพาะใน Next.js environment
- jsdom ไม่มี `matchMedia` และ `IntersectionObserver`
- การ mock ทำให้ test ไม่ error และควบคุมพฤติกรรมได้

### 3. **โครงสร้างไฟล์ Test**

```
app/(features)/upload-image/
├── hooks/
│   ├── useFileUpload.ts          # Hook ที่ต้องทดสอบ
│   └── useFileUpload.test.ts     # Unit test สำหรับ hook
├── __tests__/
│   └── uploadFlow.test.tsx       # Integration test สำหรับ flow
└── TEST_CASES.md                 # Test scenarios documentation
```

**แนวทางการจัดไฟล์:**

- Unit tests: วางไว้ข้างๆ ไฟล์ที่ทดสอบ (เช่น `useFileUpload.test.ts`)
- Integration tests: วางไว้ใน `__tests__/` folder
- Test scenarios: เขียนเป็น Markdown ใน `TEST_CASES.md`

---

## ประเภทของการทดสอบ

### 1. **Unit Tests** - ทดสอบหน่วยเล็กที่สุด

**ตัวอย่าง:** [useFileUpload.test.ts](<app/(features)/upload-image/hooks/useFileUpload.test.ts>)

```typescript
describe("useFileUpload", () => {
  it("should reject empty file array", async () => {
    vi.mocked(fileValidation.validateFile).mockResolvedValue(
      VALIDATION_ERRORS.NO_FILES
    );

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.handleFileSelect([]);
    });

    expect(result.current.uploadState.error).toBe(VALIDATION_ERRORS.NO_FILES);
  });
});
```

**จุดเด่น:**

- ทดสอบ custom hook แบบแยกส่วน
- Mock dependencies (apiService, fileValidation)
- ใช้ `renderHook()` เพื่อ test hooks นอก component
- ใช้ `act()` เพื่อ handle async state updates

### 2. **Integration Tests** - ทดสอบ flow การทำงานร่วมกัน

**ตัวอย่าง:** [uploadFlow.test.tsx](<app/(features)/upload-image/__tests__/uploadFlow.test.tsx>)

```typescript
describe("Upload Flow Integration Tests", () => {
  it("should handle successful single file upload with quality pass", async () => {
    vi.mocked(fileValidation.validateFile).mockResolvedValue(null);
    vi.mocked(apiService.post).mockResolvedValue({
      success: true,
      class_id: 3,
      class_name: "Standard",
      confident: 0.99,
      role_message: "รูปชัดเจด พร้อมส่งประเมินเบื้องต้น",
      error: null,
    });

    const user = userEvent.setup();
    render(<TestUploadComponent />);

    const input = screen.getByTestId("file-input");
    const file = createMockImageFile("test.jpg");

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByTestId("file-count")).toHaveTextContent("1");
    });
  });
});
```

**จุดเด่น:**

- ทดสอบ component ทั้งชิ้น
- จำลอง user interactions (`user.upload()`)
- ตรวจสอบ UI changes (`toHaveTextContent()`)
- Test complete workflows

---

## แนวทางการเขียน Test

### 1. **โครงสร้าง Test Suite**

```typescript
describe("Feature Name", () => {
  // Setup ก่อนแต่ละ test
  beforeEach(() => {
    vi.clearAllMocks(); // ล้าง mock calls
    // Setup อื่นๆ
  });

  // Cleanup หลัง test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Sub-feature", () => {
    it("should do something specific", () => {
      // Arrange: เตรียมข้อมูล
      // Act: ทำการกระทำ
      // Assert: ตรวจสอบผลลัพธ์
    });
  });
});
```

### 2. **AAA Pattern** (Arrange-Act-Assert)

```typescript
it("should validate file size", async () => {
  // Arrange: เตรียมข้อมูลทดสอบ
  const largeFile = createMockFile("large.jpg", "image/jpeg", MAX_SIZE + 1);
  vi.mocked(fileValidation.validateFile).mockResolvedValue(
    VALIDATION_ERRORS.FILE_TOO_LARGE
  );

  // Act: ทำการกระทำที่ต้องการทดสอบ
  const { result } = renderHook(() => useFileUpload());
  await act(async () => {
    await result.current.handleFileSelect([largeFile]);
  });

  // Assert: ตรวจสอบผลลัพธ์
  expect(result.current.uploadState.error).toBe(
    VALIDATION_ERRORS.FILE_TOO_LARGE
  );
});
```

### 3. **Mocking Strategies**

#### a) Mock External APIs

```typescript
vi.mock("@/lib/services/api.service");

// ใน test
vi.mocked(apiService.post).mockResolvedValue({
  success: true,
  data: {
    /* ... */
  },
});
```

#### b) Mock Functions

```typescript
vi.mock("./fileValidation");

vi.mocked(fileValidation.validateFile).mockResolvedValue(null); // success
vi.mocked(fileValidation.validateFile).mockResolvedValue("Error"); // failure
```

#### c) Mock Browser APIs

```typescript
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();
```

### 4. **Helper Functions**

สร้าง helper สำหรับสิ่งที่ใช้บ่อย:

```typescript
const createMockFile = (name: string, type: string, size: number): File => {
  return new File(["x".repeat(size)], name, { type });
};

const createMockImageFile = (name: string = "test.jpg"): File => {
  return createMockFile(name, "image/jpeg", 1024 * 100);
};
```

---

## ตัวอย่างการทดสอบแบบละเอียด

### Scenario 1: ทดสอบการ Upload ไฟล์เดียว

```typescript
describe("Single File Upload Flow", () => {
  it("should handle successful single file upload with quality pass", async () => {
    // 1. Mock file validation - ให้ผ่าน
    vi.mocked(fileValidation.validateFile).mockResolvedValue(null);

    // 2. Mock API quality check - ให้ผ่าน (class_id: 3)
    vi.mocked(apiService.post).mockResolvedValue({
      success: true,
      class_id: 3,
      class_name: "Standard",
      confident: 0.99,
      role_message: "รูปชัดเจด พร้อมส่งประเมินเบื้องต้น",
      error: null,
    });

    // 3. Setup user event และ render component
    const user = userEvent.setup();
    render(<TestUploadComponent />);

    // 4. หา input element
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const file = createMockImageFile("test.jpg");

    // 5. จำลองการ upload ไฟล์
    await user.upload(input, file);

    // 6. รอให้ UI update และตรวจสอบ
    await waitFor(() => {
      expect(screen.getByTestId("file-count")).toHaveTextContent("1");
    });

    expect(screen.getByTestId("file-0")).toHaveTextContent("test.jpg");
  });
});
```

### Scenario 2: ทดสอบการ Quality Check ไม่ผ่าน

```typescript
it("should handle quality check failure with option to retake", async () => {
  vi.mocked(fileValidation.validateFile).mockResolvedValue(null);

  // First upload: ไม่ผ่าน (class_id: 0)
  vi.mocked(apiService.post)
    .mockResolvedValueOnce({
      success: true,
      class_id: 0,
      class_name: "Poor",
      confident: 0.95,
      role_message: "รูปไม่ชัดเจน กรุณาถ่ายใหม่",
      error: null,
    })
    // Second upload: ผ่าน
    .mockResolvedValueOnce({
      success: true,
      class_id: 3,
      class_name: "Standard",
      confident: 0.99,
      role_message: "รูปชัดเจด",
      error: null,
    });

  // Test implementation would simulate retake flow
  expect(vi.mocked(apiService.post)).toBeDefined();
});
```

### Scenario 3: ทดสอบหลายไฟล์พร้อมกัน

```typescript
it("should handle multiple files with mixed results", async () => {
  vi.mocked(fileValidation.validateFile).mockResolvedValue(null);

  // Mock different results for each file
  vi.mocked(apiService.post)
    .mockResolvedValueOnce({
      /* file 1: pass */
    })
    .mockResolvedValueOnce({
      /* file 2: fail */
    })
    .mockResolvedValueOnce({
      /* file 3: pass */
    });

  const user = userEvent.setup();
  render(<TestUploadComponent />);

  const input = screen.getByTestId("file-input");
  const files = [
    createMockImageFile("test1.jpg"),
    createMockImageFile("test2.jpg"),
    createMockImageFile("test3.jpg"),
  ];

  await user.upload(input, files);

  await waitFor(() => {
    expect(screen.getByTestId("file-count")).toHaveTextContent("3");
  });
});
```

### Scenario 4: ทดสอบ Error Handling

```typescript
describe("Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    vi.mocked(fileValidation.validateFile).mockResolvedValue(null);
    // Mock network error
    vi.mocked(apiService.post).mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<TestUploadComponent />);

    const input = screen.getByTestId("file-input");
    const file = createMockImageFile();

    await user.upload(input, file);

    // ควรแสดง error message
    await waitFor(() => {
      expect(fileValidation.validateFile).toHaveBeenCalled();
    });
  });
});
```

---

## Testing Library Queries

### Query Priority (ตามลำดับที่แนะนำ)

1. **Accessible to everyone** (ดีที่สุด)

   - `getByRole()` - เช่น `getByRole('button', { name: 'Upload' })`
   - `getByLabelText()` - เช่น `getByLabelText('Email')`
   - `getByPlaceholderText()` - เช่น `getByPlaceholderText('Enter name')`
   - `getByText()` - เช่น `getByText('Submit')`

2. **Semantic queries**

   - `getByAltText()` - สำหรับ images
   - `getByTitle()` - สำหรับ elements with title

3. **Test IDs** (ใช้เมื่อจำเป็น)
   - `getByTestId()` - เช่น `getByTestId('file-input')`

### Query Variants

- **getBy...**: หา 1 element, throw error ถ้าไม่เจอ
- **queryBy...**: หา 1 element, return `null` ถ้าไม่เจอ (ใช้เช็คว่าไม่มี)
- **findBy...**: หา 1 element แบบ async (รอจนเจอหรือ timeout)
- **getAllBy...**: หาหลาย elements
- **queryAllBy...**: หาหลาย elements, return `[]` ถ้าไม่เจอ
- **findAllBy...**: หาหลาย elements แบบ async

### ตัวอย่างการใช้งาน

```typescript
// ✅ ดี: ใช้ role + accessible name
const button = screen.getByRole("button", { name: "Upload" });

// ✅ ดี: ใช้ label
const emailInput = screen.getByLabelText("Email Address");

// ⚠️ OK: ใช้ text content
const heading = screen.getByText("Upload Your Image");

// ⚠️ ใช้เมื่อจำเป็น: test ID
const fileInput = screen.getByTestId("file-input");

// ตรวจสอบว่า element ไม่มีอยู่
expect(screen.queryByText("Error message")).not.toBeInTheDocument();

// รอให้ element ปรากฏ (async)
const successMessage = await screen.findByText("Upload successful!");
```

---

## Custom Matchers จาก jest-dom

### DOM Matchers

```typescript
// ตรวจสอบว่า element มีอยู่ใน DOM
expect(element).toBeInTheDocument();

// ตรวจสอบ text content
expect(element).toHaveTextContent("Hello World");

// ตรวจสอบ attribute
expect(input).toHaveAttribute("type", "file");
expect(input).toHaveAttribute("accept", "image/jpeg,image/jpg,image/png");

// ตรวจสอบ class
expect(element).toHaveClass("active");

// ตรวจสอบ style
expect(element).toHaveStyle({ display: "none" });

// ตรวจสอบ focus
expect(input).toHaveFocus();

// ตรวจสอบ value
expect(input).toHaveValue("test value");

// ตรวจสอบ disabled/enabled
expect(button).toBeDisabled();
expect(button).toBeEnabled();

// ตรวจสอบ visibility
expect(element).toBeVisible();

// ตรวจสอบ form validity
expect(input).toBeValid();
expect(input).toBeInvalid();
```

---

## Async Testing

### 1. waitFor()

รอให้ assertion เป็น true (retry จนกว่าจะผ่านหรือ timeout):

```typescript
await waitFor(() => {
  expect(screen.getByText("Loading...")).not.toBeInTheDocument();
  expect(screen.getByText("Success")).toBeInTheDocument();
});
```

### 2. findBy queries

Built-in async queries (รอจนเจอหรือ timeout):

```typescript
// เหมือน waitFor + getBy
const element = await screen.findByText("Success");
```

### 3. waitForElementToBeRemoved()

รอจน element หายไปจาก DOM:

```typescript
await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
```

### 4. act()

Wrap การเปลี่ยนแปลง state ที่เกิดจาก user interactions:

```typescript
await act(async () => {
  await result.current.handleFileSelect([file]);
});
```

---

## คำสั่งที่ใช้บ่อย

```bash
# Run all tests
npm test

# Run tests ใน watch mode (auto-rerun เมื่อไฟล์เปลี่ยน)
npm test -- --watch

# Run specific test file
npm test useFileUpload.test.ts

# Run tests with UI dashboard
npm run test:ui

# Generate code coverage report
npm run test:coverage

# Run tests in CI mode (no watch)
npm test -- --run
```

---

## Best Practices

### ✅ Do's

1. **ทดสอบพฤติกรรม ไม่ใช่ implementation**

   ```typescript
   // ✅ ดี: ทดสอบผลลัพธ์ที่ user เห็น
   expect(screen.getByText("Upload successful")).toBeInTheDocument();

   // ❌ ไม่ดี: ทดสอบ internal state
   expect(component.state.uploadStatus).toBe("success");
   ```

2. **ใช้ user-event แทน fireEvent**

   ```typescript
   // ✅ ดี: จำลอง user interaction แบบเหมือนจริง
   await user.click(button);
   await user.type(input, "Hello");

   // ❌ ไม่ดี: trigger event ตรงๆ
   fireEvent.click(button);
   ```

3. **Mock เฉพาะสิ่งที่จำเป็น**

   ```typescript
   // ✅ ดี: Mock external API
   vi.mock("@/lib/services/api.service");

   // ❌ ไม่ดี: Mock ทุกอย่าง รวมถึง business logic ที่ควรทดสอบ
   ```

4. **ใช้ data-testid เมื่อจำเป็นเท่านั้น**

   ```typescript
   // ✅ ดีที่สุด: ใช้ role
   screen.getByRole("button", { name: "Submit" });

   // ⚠️ OK: ใช้ test ID เมื่อไม่มี semantic way
   screen.getByTestId("file-input");
   ```

5. **เขียน test ที่อ่านง่าย**
   ```typescript
   // ✅ ดี: ชื่อ test บอกสิ่งที่ทดสอบชัดเจน
   it("should show error when file size exceeds limit", () => {
     // test code
   });
   ```

### ❌ Don'ts

1. **อย่าทดสอบ implementation details**
2. **อย่า hard-code timeout values** (ใช้ waitFor ให้มาก)
3. **อย่า skip cleanup** (ใช้ afterEach cleanup)
4. **อย่าเขียน test ที่ depend กัน** (แต่ละ test ควร independent)
5. **อย่า test library code** (เช่น React, Next.js เอง)

---

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

ดู coverage report:

```bash
npm run test:coverage
```

จะสร้างไฟล์ HTML report ที่ `coverage/index.html`

---

## Debugging Tests

### 1. ใช้ screen.debug()

```typescript
// Print DOM tree
screen.debug();

// Print specific element
screen.debug(screen.getByTestId("file-input"));
```

### 2. ใช้ console.log

```typescript
console.log(result.current.uploadState);
```

### 3. ใช้ logRoles()

```typescript
import { logRoles } from "@testing-library/react";

const { container } = render(<Component />);
logRoles(container); // แสดง available roles
```

### 4. Run single test

```typescript
// ใช้ .only เพื่อ run แค่ test นี้
it.only("should do something", () => {
  // test code
});
```

---

## สรุป

การทดสอบในโปรเจคนี้มี 3 ชั้น:

1. **Unit Tests** (hooks, utilities)

   - ทดสอบแยกส่วน
   - Mock dependencies ทั้งหมด
   - เร็ว, แยกปัญหาได้ง่าย

2. **Integration Tests** (components, flows)

   - ทดสอบการทำงานร่วมกัน
   - Mock เฉพาะ external APIs
   - จำลอง user interactions

3. **E2E Tests** (ถ้ามี - ยังไม่ได้ setup)
   - ทดสอบ full application
   - ใช้ browser จริง
   - ช้าแต่ครอบคลุมที่สุด

**หลักการสำคัญ:**

- เขียน test ที่อ่านง่าย maintainable
- ทดสอบจากมุมมอง user
- Mock เฉพาะสิ่งที่จำเป็น
- ใช้ accessibility queries
- Keep tests independent

---

## เอกสารเพิ่มเติม

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro)

---

**หมายเหตุ:** คู่มือนี้สร้างขึ้นเพื่ออธิบายระบบการทดสอบของโปรเจค Frontend อย่างละเอียด สามารถใช้เป็น reference เมื่อเขียน test ใหม่หรือแก้ไข test ที่มีอยู่
