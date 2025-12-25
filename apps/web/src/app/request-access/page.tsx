import RequestAccessForm from "./request-access-form";

export const metadata = {
  title: "Request for Access — My House"
};

export default function RequestAccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Request for Access</h1>
      <p className="mt-2 text-sm text-gray-600">
        Create your applicant profile. After login, you will complete a short application/KYC form for review.
      </p>

      <div className="mt-8 rounded-lg border bg-white p-5">
        <RequestAccessForm />
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Note: Approval is required before you gain tenant access.
      </p>
    </div>
  );
}
