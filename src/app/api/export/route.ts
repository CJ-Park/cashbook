import type { NextRequest } from "next/server";
import { requireUser } from "@/features/auth/queries/require-user";
import {
  createTransactionExportFilename,
  createTransactionWorkbook,
} from "@/features/transactions/export/create-transaction-workbook";
import { getTransactions } from "@/features/transactions/queries/get-transactions";
import {
  isValidTransactionSearchDate,
  parseTransactionSearchParams,
} from "@/features/transactions/queries/search-conditions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const hasInvalidDate = ["startDate", "endDate"].some((key) => {
    const value = request.nextUrl.searchParams.get(key);

    return value !== null && value !== "" && !isValidTransactionSearchDate(value);
  });

  if (hasInvalidDate) {
    return Response.json(
      { message: "날짜 검색 조건이 올바르지 않습니다." },
      { status: 400, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const condition = parseTransactionSearchParams(request.nextUrl.searchParams);
  const result = await getTransactions(user.id, condition);
  const workbookBuffer = createTransactionWorkbook(result.transactions);
  const filename = createTransactionExportFilename(condition);

  return new Response(new Uint8Array(workbookBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
