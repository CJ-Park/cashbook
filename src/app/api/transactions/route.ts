import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/queries/get-current-user";
import { getTransactionPage } from "@/features/transactions/queries/get-transactions";
import {
  isValidTransactionSearchDate,
  parseTransactionSearchParams,
} from "@/features/transactions/queries/search-conditions";

const PRIVATE_JSON_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { message: "로그인이 필요합니다." },
      { status: 401, headers: PRIVATE_JSON_HEADERS },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const hasInvalidSearchDate = ["startDate", "endDate"].some((key) => {
    const value = searchParams.get(key);

    return value !== null && value !== "" && !isValidTransactionSearchDate(value);
  });
  const cursorDate = searchParams.get("cursorDate");
  const cursorIdValue = searchParams.get("cursorId");
  const cursorId = Number(cursorIdValue);

  if (
    hasInvalidSearchDate ||
    !cursorDate ||
    !isValidTransactionSearchDate(cursorDate) ||
    !cursorIdValue ||
    !Number.isSafeInteger(cursorId) ||
    cursorId <= 0
  ) {
    return Response.json(
      { message: "페이지 요청 정보가 올바르지 않습니다." },
      { status: 400, headers: PRIVATE_JSON_HEADERS },
    );
  }

  const condition = parseTransactionSearchParams(searchParams);

  if (condition.validationError) {
    return Response.json(
      { message: condition.validationError },
      { status: 400, headers: PRIVATE_JSON_HEADERS },
    );
  }

  const page = await getTransactionPage(user.id, condition, {
    transactionDate: cursorDate,
    id: cursorId,
  });

  return Response.json(page, { headers: PRIVATE_JSON_HEADERS });
}
