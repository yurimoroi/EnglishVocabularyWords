import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .max(30, "パスワードは30文字以下で入力してください")
  .regex(/[a-z]/, "小文字の英字を含めてください")
  .regex(/[A-Z]/, "大文字の英字を含めてください")
  .regex(/[0-9]/, "数字を含めてください")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "記号を含めてください");

export const signupSchema = z
  .object({
    lastName: z.string().min(1, "姓を入力してください"),
    firstName: z.string().min(1, "名を入力してください"),
    lastNameKana: z
      .string()
      .min(1, "姓（カナ）を入力してください")
      .regex(/^[ァ-ヶー]+$/, "カタカナで入力してください"),
    firstNameKana: z
      .string()
      .min(1, "名（カナ）を入力してください")
      .regex(/^[ァ-ヶー]+$/, "カタカナで入力してください"),
    birthDate: z.string().min(1, "生年月日を入力してください"),
    age: z.string().min(1, "年齢を入力してください"),
    occupation: z.string().min(1, "職業を選択してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/[A-Z]/, "大文字を含めてください")
      .regex(/[a-z]/, "小文字を含めてください")
      .regex(/[0-9]/, "数字を含めてください")
      .regex(/[^A-Za-z0-9]/, "記号を含めてください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });
