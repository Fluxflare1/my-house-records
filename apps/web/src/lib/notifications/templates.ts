export function rentCreatedText(params: { amount: number; dueDate: string }) {
  return `New Rent Posted: Amount ${params.amount}. Due date: ${params.dueDate}.`;
}

export function billCreatedText(params: { amount: number; dueDate: string }) {
  return `New Bill/Charge Posted: Amount ${params.amount}. Due date: ${params.dueDate}.`;
}

export function paymentStatusText(params: { status: "verified" | "rejected" }) {
  return `Your payment has been ${params.status.toUpperCase()}.`;
}
