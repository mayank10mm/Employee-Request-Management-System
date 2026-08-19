import { Department } from "@prisma/client";

const RULES: { department: Department; keywords: string[] }[] = [
  {
    department: Department.PAYROLL,
    keywords: [
      "salary",
      "salaries",
      "payslip",
      "pay slip",
      "payroll",
      "payment",
      "credited",
      "bank account",
      "ctc",
      "pf",
      "provident",
      "tax deduction",
      "tds",
    ],
  },
  {
    department: Department.IT,
    keywords: [
      "laptop",
      "wifi",
      "wi-fi",
      "computer",
      "software",
      "password",
      "vpn",
      "email account",
      "outlook",
      "monitor",
      "keyboard",
      "mouse",
      "printer",
      "network",
      "internet",
      "system down",
    ],
  },
  {
    department: Department.HR,
    keywords: [
      "leave",
      "vacation",
      "attendance",
      "holiday",
      "onboarding",
      "resignation",
      "joining",
      "hr policy",
      "maternity",
      "paternity",
      "wfh",
      "work from home",
    ],
  },
  {
    department: Department.OPERATIONS,
    keywords: [
      "access card",
      "id card",
      "badge",
      "office access",
      "parking",
      "facility",
      "facilities",
      "desk",
      "cabin",
      "ac not",
      "air conditioning",
      "security gate",
      "visitor",
    ],
  },
];

export function categorizeRequest(subject: string, description: string): Department {
  const text = `${subject} ${description}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.department;
    }
  }

  return Department.OTHER;
}
