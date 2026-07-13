import * as XLSX from "xlsx";
import type { TransactionRow, TransactionSearchCondition } from "../types";

const KOREA_TIME_ZONE = "Asia/Seoul";
const WORKSHEET_NAME = "입출금 내역";
const HEADERS = ["날짜", "구분", "카테고리", "내용", "금액", "메모", "등록일"];

const koreaDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: KOREA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function toExcelDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function toKoreaWallClockDate(date: Date) {
  const parts = Object.fromEntries(
    koreaDateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ),
  );
}

export function createTransactionWorkbook(transactions: TransactionRow[]) {
  const rows = transactions.map((transaction) => [
    toExcelDate(transaction.transactionDate),
    transaction.type === "INCOME" ? "입금" : "출금",
    transaction.categoryName,
    transaction.title,
    transaction.amount,
    transaction.memo ?? "",
    toKoreaWallClockDate(transaction.createdAt),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows], {
    cellDates: true,
    UTC: true,
  });

  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 8 },
    { wch: 18 },
    { wch: 32 },
    { wch: 16 },
    { wch: 36 },
    { wch: 18 },
  ];
  worksheet["!autofilter"] = { ref: `A1:G${Math.max(rows.length + 1, 1)}` };

  for (let rowNumber = 2; rowNumber <= rows.length + 1; rowNumber += 1) {
    const transactionDateCell = worksheet[`A${rowNumber}`];
    const amountCell = worksheet[`E${rowNumber}`];
    const createdAtCell = worksheet[`G${rowNumber}`];

    if (transactionDateCell) {
      transactionDateCell.z = "yyyy-mm-dd";
    }

    if (amountCell) {
      amountCell.z = '#,##0"원"';
    }

    if (createdAtCell) {
      createdAtCell.z = "yyyy-mm-dd hh:mm";
    }
  }

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "입출금 내역",
    Subject: "cashbook 검색 결과",
    Author: "cashbook",
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(workbook, worksheet, WORKSHEET_NAME);

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
    compression: true,
    cellStyles: true,
  });
}

export function createTransactionExportFilename(condition: TransactionSearchCondition) {
  if (condition.startDate && condition.endDate) {
    return `cashbook_${condition.startDate}_${condition.endDate}.xlsx`;
  }

  if (condition.startDate) {
    return `cashbook_from_${condition.startDate}.xlsx`;
  }

  if (condition.endDate) {
    return `cashbook_to_${condition.endDate}.xlsx`;
  }

  return "cashbook_all.xlsx";
}
