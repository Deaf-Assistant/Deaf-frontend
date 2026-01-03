# มาตรฐานการเขียนโค้ดโปรเจค Next.js

npm install
npm run dev

## กฎการตั้งชื่อไฟล์และโฟลเดอร์

### ไฟล์

- **Components**: ใช้ PascalCase (เช่น `UserProfile.tsx`, `NavigationBar.tsx`)
- **Utilities/Helpers**: ใช้ camelCase (เช่น `formatDate.ts`, `apiHelper.ts`)
- **Hooks**: ใช้ camelCase ขึ้นต้นด้วย `use` (เช่น `useAuth.ts`, `useFetchData.ts`)
- **Constants**: ใช้ตัวพิมพ์ใหญ่ทั้งหมดและขีดล่าง (เช่น `API_ENDPOINTS.ts`, `APP_CONFIG.ts`)
- **Types/Interfaces**: ใช้ PascalCase (เช่น `UserTypes.ts`, `ApiResponse.ts`)

### โฟลเดอร์

- ใช้ kebab-case สำหรับโฟลเดอร์ทั้งหมด (เช่น `user-management/`, `api-services/`)

## กฎการตั้งชื่อในโค้ด

### ฟังก์ชัน

- **ฟังก์ชันทั่วไป**: ใช้ camelCase (เช่น `getUserData()`, `handleSubmit()`)
- **Event handlers**: ขึ้นต้นด้วย `handle` (เช่น `handleClick()`, `handleInputChange()`)
- **Async functions**: ตั้งชื่อให้ชัดเจน (เช่น `fetchUserData()`, `loadProducts()`)

### ตัวแปร

- ใช้ camelCase (เช่น `userData`, `isLoading`, `totalCount`)
- ตัวแปร Boolean ควรขึ้นต้นด้วย `is`, `has`, `should` (เช่น `isActive`, `hasPermission`)

### ค่าคงที่ (Constants)

- ใช้ตัวพิมพ์ใหญ่และขีดล่าง (เช่น `MAX_RETRY_COUNT`, `API_BASE_URL`)

### Components

- ใช้ PascalCase (เช่น `UserCard`, `ProductList`)

### Interfaces/Types

- ใช้ PascalCase (เช่น `User`)
- ตั้งชื่อให้สื่อความหมาย (เช่น `UserProfileProps`, `ApiResponse`)

## การตั้งชื่อ Git Branch

### โครงสร้าง Branch

```
dev-[ชื่อตามหมายเลขใน SRS]-สื่งที่ page นั้นทำ เช่น dev-FR-1-Storage-Page
```
ในบทที่ 3 Functional requirement
'''

### ขั้นตอนการทำงานกับ Branch

1. สร้าง branch ใหม่จาก `develop` เสมอ (ก่อนสร้างอย่าลืมpull version ล่าสุดของdevมา)
2. ใช้ Functional requirement ในชื่อ branch

## มาตรฐาน Commit Message

### รูปแบบ

```
[Functional require] type: ชื่อcard
คำอธิบาย
```

### Conventional Commit Types

- **feat**: เพิ่มฟีเจอร์ใหม่
- **fix**: แก้ไขบั๊ก
- **docs**: เปลี่ยนแปลงเอกสาร
- **style**: เปลี่ยนแปลง formatting, missing semi colons, etc (ไม่กระทบโค้ด)
- **refactor**: ปรับปรุงโค้ดที่ไม่ใช่การแก้บั๊กหรือเพิ่มฟีเจอร์
- **perf**: ปรับปรุง performance
- **test**: เพิ่มหรือแก้ไข tests
- **build**: เปลี่ยนแปลงที่กระทบ build system หรือ dependencies
- **ci**: เปลี่ยนแปลง CI configuration files และ scripts
- **chore**: งานอื่นๆ ที่ไม่กระทบ src หรือ test files

### ตัวอย่าง

```
[FR-1] feat: setting project
วางโครงสร้างระบบ initial setup

[FR-2] feat: upload page
สร้างหน้า upload รูปภาพ

[NFR-5] fix: validation error
แก้ไขปัญหา validation ที่ form upload

[NFR-2] refactor: optimize image processing
ปรับปรุง logic การประมวลผลรูปภาพ
```
commit ใน branch ก่อน และค่อย pull request
'''
## โครงสร้างโปรเจค

```
/project-root
├── /app                    # Next.js app directory
│   ├── /[page]         # Dynamic routes
│   └── layout.tsx
├── /components
│   ├── /ui                # UI components ที่ใช้ซ้ำได้
│   ├── /forms             # Form components
│   └── /layout            # Layout components
├── /lib                   # Utility functions
├── /hooks                 # Custom React hooks
├── /types                 # TypeScript types/interfaces
├── /constants             # ค่าคงที่ของแอป
├── /config                # ไฟล์ Configuration
│   └── api.config.ts      # การตั้งค่า API endpoints
├── /services              # API services
│   └── api.service.ts     # Main API service
├── /styles               # Global styles
└── /public               # Static assets
```

## แนวทางการเขียนโค้ด

### TypeScript

- ใช้ TypeScript เสมอ
- กำหนด types สำหรับ props, state และ function parameters ทั้งหมด
- หลีกเลี่ยงการใช้ `any` - ใช้ `unknown` ถ้าไม่รู้ type จริงๆ
- ใช้ interfaces สำหรับ object shapes, ใช้ types สำหรับ unions/intersections

### React/Next.js

- ใช้ functional components กับ hooks
- ทำให้ components มีขนาดเล็กและมีหน้าที่เดียว (single responsibility)
- ใช้ Server Components เป็นค่าเริ่มต้น, Client Components เมื่อจำเป็น
- ใช้ error boundaries ที่เหมาะสม
- ใช้ `async/await` สำหรับการทำงานแบบ asynchronous

### การ Import

- จัดกลุ่ม imports ตามลำดับนี้:
  1. External libraries (React, Next.js, ฯลฯ)
  2. Internal utilities/services
  3. Components
  4. Types
  5. Styles

```typescript
import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/utils";
import { apiService } from "@/services/api";

import UserCard from "@/components/UserCard";
import Button from "@/components/ui/Button";

import { User } from "@/types/user";

import styles from "./page.module.css";
```

## เทมเพลต Component

```typescript
import { FC } from "react";

interface ComponentNameProps {
  title: string;
  isActive?: boolean;
}

const ComponentName: FC<ComponentNameProps> = ({ title, isActive = false }) => {
  // Hooks อยู่ด้านบน
  const [state, setState] = useState();

  // Handler functions
  const handleAction = () => {
    // logic อยู่ที่นี่
  };

  // Render
  return <div>{/* JSX อยู่ที่นี่ */}</div>;
};

export default ComponentName;
```

## Comments และ Documentation

- ใช้ JSDoc สำหรับ documentation ของฟังก์ชัน
- เขียน comment สำหรับ logic ที่ซับซ้อน ไม่ใช่โค้ดที่เห็นได้ชัด
- อัพเดท comments ให้ตรงกับโค้ดเสมอ
- ใช้ TODO comments พร้อม Jira ID: `// TODO [PROJ-123]: ทำระบบ caching`

## การทดสอบ (Testing)

- วางไฟล์ test ไว้ข้างๆ ไฟล์ที่ทดสอบ
- ตั้งชื่อไฟล์ test: `ComponentName.test.tsx`
- เขียน unit tests สำหรับ utilities และ business logic
- เขียน integration tests สำหรับ user flows ที่สำคัญ

## รายการตรวจสอบ Code Review

- [ ] โค้ดทำตามกฎการตั้งชื่อ
- [ ] ไม่มี console.logs หรือโค้ดที่ comment ไว้
- [ ] TypeScript types กำหนดอย่างถูกต้อง
- [ ] Components จัดระเบียบเรียบร้อย
- [ ] มีการจัดการ error
- [ ] โค้ดจัดรูปแบบถูกต้อง (Prettier)
- [ ] ไม่มี linting errors (ESLint)
- [ ] มีการเขียน tests และผ่านทั้งหมด
- [ ] Commit messages ทำตามมาตรฐาน

## แนวทางปฏิบัติที่ดีเพิ่มเติม

1. **Performance**: ใช้ dynamic imports สำหรับ components ขนาดใหญ่
2. **Security**: ห้าม commit ข้อมูลที่ sensitive หรือ API keys
3. **Environment Variables**: ใช้ `.env.local` สำหรับการพัฒนาในเครื่อง
4. **Dependencies**: อัพเดท packages เป็นประจำ และตรวจสอบช่องโหว่

---

## การตั้งค่า API Configuration

### Environment Variables (.env.local)

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_TIMEOUT=30000
```
