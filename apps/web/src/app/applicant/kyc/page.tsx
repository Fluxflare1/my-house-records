import ApplicantKycForm from "./ui";

export const metadata = {
  title: "Applicant KYC — My House"
};

export default function ApplicantKycPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Application / KYC</h1>
      <p className="mt-2 text-sm text-gray-600">
        Complete your application. You will choose an apartment type and preferred area/property.
      </p>

      <div className="mt-6 rounded-lg border bg-white p-5">
        <ApplicantKycForm />
      </div>
    </div>
  );
}
