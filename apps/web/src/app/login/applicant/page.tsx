import ApplicantLoginForm from "./ui";

export const metadata = {
  title: "Applicant Login — My House"
};

export default function ApplicantLoginPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const created = searchParams?.created === "1";
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Applicant Login</h1>
      <p className="mt-2 text-sm text-gray-600">
        Log in to complete your application and track approval status.
      </p>

      {created ? (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Account created. Please log in to continue.
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border bg-white p-5">
        <ApplicantLoginForm />
      </div>
    </div>
  );
}
