import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/queries/get-current-user";
import {
  createTransactionExportFilename,
  createTransactionWorkbook,
} from "@/features/transactions/export/create-transaction-workbook";
import { validateTransactionExportPeriod } from "@/features/transactions/export/validate-export-period";
import { getTransactionsForExport } from "@/features/transactions/queries/get-transactions";
import { parseTransactionSearchParams } from "@/features/transactions/queries/search-conditions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");
  const periodValidation = validateTransactionExportPeriod(startDate, endDate);

  if (!periodValidation.isValid) {
    return Response.json(
      { message: periodValidation.message },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  const condition = parseTransactionSearchParams(request.nextUrl.searchParams);
  const transactions = await getTransactionsForExport(user.id, condition);
  const workbookBuffer = createTransactionWorkbook(transactions);
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
