import { useMemo, useState } from "react";

type BillingAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type Transaction = {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  businessName?: string;
  billingAddress?: Partial<BillingAddress>;
  customerComments?: string;
  last4Digits?: string;
  amount: number;
  beneficiary: string;
  donationDate: string;
  status: "pending" | "complete";
};

type CustomerTransactionFormObject = {
  transactionId: string;
  email: string;
  phone: string;
  name: string;
  businessName: string;
  billingAddress: BillingAddress;
  customerComments: string;
  last4Digits: string;
  internalComments: string;
  reasonForTransaction: string;
  amount: number;
  beneficiary: string;
  donationDate: string | null;
};

type AcknowledgmentLetterFormObject = {
  transactionId: string;
  customMessage: string;
  name: string;
  email: string;
  amount: number;
  beneficiary: string;
  donationDate: string | null;
  template: "default" | "business_donation" | "large_donation";
};

type EmailFormObject = {
  transactionId: string;
  subject: string;
  to: string;
  message: string;
  acknowledgmentLetter: string | null;
};

type TransactionWorkflowState = {
  currentStep: 1 | 2 | 3;
  completed: boolean;
  customerTransactionFormObject: CustomerTransactionFormObject;
  acknowledgmentLetterFormObject: AcknowledgmentLetterFormObject;
  emailFormObject: EmailFormObject;
};

const mockTransactions: Transaction[] = [
  {
    id: "txn_1001",
    donorName: "Maria Santos",
    donorEmail: "maria.santos@example.com",
    donorPhone: "555-111-2222",
    businessName: "",
    billingAddress: {
      line1: "123 Main St",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "US",
    },
    customerComments: "In memory of a loved one",
    last4Digits: "4242",
    amount: 150,
    beneficiary: "Scholarship Fund",
    donationDate: "2026-04-10",
    status: "pending",
  },
  {
    id: "txn_1002",
    donorName: "Acme Corporation",
    donorEmail: "giving@acme.org",
    donorPhone: "555-333-4444",
    businessName: "Acme Corporation",
    billingAddress: {
      line1: "500 Market St",
      city: "Philadelphia",
      state: "PA",
      postal_code: "19106",
      country: "US",
    },
    customerComments: "Annual corporate donation",
    last4Digits: "1881",
    amount: 5000,
    beneficiary: "General Fund",
    donationDate: "2026-04-11",
    status: "pending",
  },
];

function createCustomerTransactionFormObject(
  transaction: Transaction,
): CustomerTransactionFormObject {
  return {
    transactionId: transaction.id,
    email: transaction.donorEmail,
    phone: transaction.donorPhone,
    name: transaction.donorName,
    businessName: transaction.businessName ?? "",
    billingAddress: {
      line1: transaction.billingAddress?.line1 ?? "",
      line2: transaction.billingAddress?.line2 ?? "",
      city: transaction.billingAddress?.city ?? "",
      state: transaction.billingAddress?.state ?? "",
      postal_code: transaction.billingAddress?.postal_code ?? "",
      country: transaction.billingAddress?.country ?? "",
    },
    customerComments: transaction.customerComments ?? "",
    last4Digits: transaction.last4Digits ?? "",
    internalComments: "",
    reasonForTransaction: "donation",
    amount: transaction.amount,
    beneficiary: transaction.beneficiary,
    donationDate: transaction.donationDate,
  };
}

function createAcknowledgmentLetterFormObject(
  customerForm: CustomerTransactionFormObject,
): AcknowledgmentLetterFormObject {
  return {
    transactionId: customerForm.transactionId,
    customMessage: "Thank you for your generous support.",
    name: customerForm.name,
    email: customerForm.email,
    amount: customerForm.amount,
    beneficiary: customerForm.beneficiary,
    donationDate: customerForm.donationDate,
    template: customerForm.businessName ? "business_donation" : "default",
  };
}

function createEmailFormObject(
  acknowledgmentForm: AcknowledgmentLetterFormObject,
): EmailFormObject {
  return {
    transactionId: acknowledgmentForm.transactionId,
    subject: `Thank you for your donation to ${acknowledgmentForm.beneficiary}`,
    to: acknowledgmentForm.email,
    message: `Dear ${acknowledgmentForm.name},\n\nPlease find your acknowledgment letter attached. Thank you again for your donation.`,
    acknowledgmentLetter: `ack-letter-${acknowledgmentForm.transactionId}.pdf`,
  };
}

function createWorkflowState(
  transaction: Transaction,
): TransactionWorkflowState {
  const customerTransactionFormObject =
    createCustomerTransactionFormObject(transaction);
  const acknowledgmentLetterFormObject = createAcknowledgmentLetterFormObject(
    customerTransactionFormObject,
  );
  const emailFormObject = createEmailFormObject(acknowledgmentLetterFormObject);

  return {
    currentStep: 1,
    completed: false,
    customerTransactionFormObject,
    acknowledgmentLetterFormObject,
    emailFormObject,
  };
}

export default function MultiStepTransactionFormPrototype() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(mockTransactions[0]?.id ?? null);
  const [workflowByTransactionId, setWorkflowByTransactionId] = useState<
    Record<string, TransactionWorkflowState>
  >(() => {
    return Object.fromEntries(
      mockTransactions.map((tx) => [tx.id, createWorkflowState(tx)]),
    );
  });

  const [footerVisible, setFooterVisible] = useState(false);

  const toggleFooter = () => {
    setFooterVisible((prev) => !prev);
  };

  const selectedTransaction = useMemo(
    () => transactions.find((tx) => tx.id === selectedTransactionId) ?? null,
    [transactions, selectedTransactionId],
  );

  const selectedWorkflow = selectedTransactionId
    ? workflowByTransactionId[selectedTransactionId]
    : null;

  const updateWorkflow = (
    transactionId: string,
    updater: (current: TransactionWorkflowState) => TransactionWorkflowState,
  ) => {
    setWorkflowByTransactionId((prev) => ({
      ...prev,
      [transactionId]: updater(prev[transactionId]),
    }));
  };

  const markTransactionComplete = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId ? { ...tx, status: "complete" } : tx,
      ),
    );
  };

  const goToNextStep = () => {
    if (!selectedTransactionId || !selectedWorkflow) return;

    updateWorkflow(selectedTransactionId, (current) => {
      if (current.currentStep === 1) {
        return {
          ...current,
          currentStep: 2,
          acknowledgmentLetterFormObject: {
            ...current.acknowledgmentLetterFormObject,
            transactionId: current.customerTransactionFormObject.transactionId,
            name: current.customerTransactionFormObject.name,
            email: current.customerTransactionFormObject.email,
            amount: current.customerTransactionFormObject.amount,
            beneficiary: current.customerTransactionFormObject.beneficiary,
            donationDate: current.customerTransactionFormObject.donationDate,
          },
        };
      }

      if (current.currentStep === 2) {
        return {
          ...current,
          currentStep: 3,
          emailFormObject: {
            ...current.emailFormObject,
            transactionId: current.acknowledgmentLetterFormObject.transactionId,
            to: current.acknowledgmentLetterFormObject.email,
            acknowledgmentLetter: `ack-letter-${current.acknowledgmentLetterFormObject.transactionId}.pdf`,
          },
        };
      }

      return current;
    });
  };

  const goToPreviousStep = () => {
    if (!selectedTransactionId || !selectedWorkflow) return;

    updateWorkflow(selectedTransactionId, (current) => ({
      ...current,
      currentStep: Math.max(1, current.currentStep - 1) as 1 | 2 | 3,
    }));
  };

  const completeStepThree = () => {
    if (!selectedTransactionId || !selectedWorkflow) return;

    updateWorkflow(selectedTransactionId, (current) => ({
      ...current,
      completed: true,
      currentStep: 3,
    }));

    markTransactionComplete(selectedTransactionId);
  };

  const renderStepIndicator = (label: string, stepNumber: 1 | 2 | 3) => {
    const active = selectedWorkflow?.currentStep === stepNumber;
    const done =
      (selectedWorkflow?.currentStep ?? 0) > stepNumber ||
      (stepNumber === 3 && selectedWorkflow?.completed);

    return (
      <div
        className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
          active ? "border-black bg-black text-white" : "bg-white"
        } ${done && !active ? "border-green-600" : "border-gray-200"}`}
      >
        <div className="font-semibold">Step {stepNumber}</div>
        <div>{label}</div>
      </div>
    );
  };

  if (!selectedTransaction || !selectedWorkflow) {
    return <div className="p-6">No transaction selected</div>;
  }

  const customerForm = selectedWorkflow.customerTransactionFormObject;
  const acknowledgmentForm = selectedWorkflow.acknowledgmentLetterFormObject;
  const emailForm = selectedWorkflow.emailFormObject;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select a transaction and complete all three steps
          </p>

          <div className="mt-4 space-y-3">
            {transactions.map((tx) => {
              const workflow = workflowByTransactionId[tx.id];
              const isSelected = tx.id === selectedTransactionId;

              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransactionId(tx.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{tx.id}</div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        tx.status === "complete"
                          ? "bg-green-100 text-green-700"
                          : isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm opacity-90">{tx.donorName}</div>
                  <div className="text-sm opacity-80">
                    ${tx.amount.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs opacity-75">
                    <strong className="current-step">Current step: {workflow.currentStep}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="rounded-3xl bg-white p-6 shadow-sm">
          {selectedWorkflow.currentStep === 1 && (
            <section className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Step 1: Customer & Donation Form
                </h3>
                <p className="text-sm text-gray-600">
                  Fill and edit the customerTransactionFormObject before
                  recording to Excel
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Name"
                  value={customerForm.name}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        name: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Email"
                  value={customerForm.email}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        email: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Phone"
                  value={customerForm.phone}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        phone: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Business Name"
                  value={customerForm.businessName}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        businessName: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Reason for Transaction"
                  value={customerForm.reasonForTransaction}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        reasonForTransaction: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Last 4 Digits"
                  value={customerForm.last4Digits}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        last4Digits: value,
                      },
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Address Line 1"
                  value={customerForm.billingAddress.line1}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          line1: value,
                        },
                      },
                    }))
                  }
                />
                <InputField
                  label="Address Line 2"
                  value={customerForm.billingAddress.line2}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          line2: value,
                        },
                      },
                    }))
                  }
                />
                <InputField
                  label="City"
                  value={customerForm.billingAddress.city}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          city: value,
                        },
                      },
                    }))
                  }
                />
                <InputField
                  label="State"
                  value={customerForm.billingAddress.state}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          state: value,
                        },
                      },
                    }))
                  }
                />
                <InputField
                  label="Postal Code"
                  value={customerForm.billingAddress.postal_code}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          postal_code: value,
                        },
                      },
                    }))
                  }
                />
                <InputField
                  label="Country"
                  value={customerForm.billingAddress.country}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      customerTransactionFormObject: {
                        ...current.customerTransactionFormObject,
                        billingAddress: {
                          ...current.customerTransactionFormObject
                            .billingAddress,
                          country: value,
                        },
                      },
                    }))
                  }
                />
              </div>

              <TextAreaField
                label="Customer Comments"
                value={customerForm.customerComments}
                onChange={(value) =>
                  updateWorkflow(selectedTransaction.id, (current) => ({
                    ...current,
                    customerTransactionFormObject: {
                      ...current.customerTransactionFormObject,
                      customerComments: value,
                    },
                  }))
                }
              />

              <TextAreaField
                label="Internal Comments"
                value={customerForm.internalComments}
                onChange={(value) =>
                  updateWorkflow(selectedTransaction.id, (current) => ({
                    ...current,
                    customerTransactionFormObject: {
                      ...current.customerTransactionFormObject,
                      internalComments: value,
                    },
                  }))
                }
              />

              <ReadOnlyCard
                title="Non-editable Stripe Reference Fields"
                fields={[
                  ["Transaction ID", customerForm.transactionId],
                  ["Amount", `$${customerForm.amount.toFixed(2)}`],
                  ["Beneficiary", customerForm.beneficiary],
                  ["Donation Date", customerForm.donationDate ?? ""],
                ]}
              />
            </section>
          )}

          {selectedWorkflow.currentStep === 2 && (
            <section className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Step 2: Acknowledgment Letter Draft
                </h3>
                <p className="text-sm text-gray-600">
                  Edit the custom message and template while transaction data
                  stays read-only
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Template"
                  value={acknowledgmentForm.template}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      acknowledgmentLetterFormObject: {
                        ...current.acknowledgmentLetterFormObject,
                        template:
                          value as AcknowledgmentLetterFormObject["template"],
                      },
                    }))
                  }
                  options={[
                    { label: "Default", value: "default" },
                    { label: "Business Donation", value: "business_donation" },
                    { label: "Large Donation", value: "large_donation" },
                  ]}
                />
              </div>

              <TextAreaField
                label="Custom Message"
                value={acknowledgmentForm.customMessage}
                onChange={(value) =>
                  updateWorkflow(selectedTransaction.id, (current) => ({
                    ...current,
                    acknowledgmentLetterFormObject: {
                      ...current.acknowledgmentLetterFormObject,
                      customMessage: value,
                    },
                  }))
                }
              />

              <ReadOnlyCard
                title="Acknowledgment Letter Read-Only Data"
                fields={[
                  ["Transaction ID", acknowledgmentForm.transactionId],
                  ["Name", acknowledgmentForm.name],
                  ["Email", acknowledgmentForm.email],
                  ["Amount", `$${acknowledgmentForm.amount.toFixed(2)}`],
                  ["Beneficiary", acknowledgmentForm.beneficiary],
                  ["Donation Date", acknowledgmentForm.donationDate ?? ""],
                ]}
              />
            </section>
          )}

          {selectedWorkflow.currentStep === 3 && (
            <section className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Step 3: Email</h3>
                <p className="text-sm text-gray-600">
                  Send the email with the generated acknowledgment letter
                  attached. Completing this step marks the transaction complete
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="To"
                  value={emailForm.to}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      emailFormObject: {
                        ...current.emailFormObject,
                        to: value,
                      },
                    }))
                  }
                />
                <InputField
                  label="Subject"
                  value={emailForm.subject}
                  onChange={(value) =>
                    updateWorkflow(selectedTransaction.id, (current) => ({
                      ...current,
                      emailFormObject: {
                        ...current.emailFormObject,
                        subject: value,
                      },
                    }))
                  }
                />
              </div>

              <TextAreaField
                label="Message"
                value={emailForm.message}
                onChange={(value) =>
                  updateWorkflow(selectedTransaction.id, (current) => ({
                    ...current,
                    emailFormObject: {
                      ...current.emailFormObject,
                      message: value,
                    },
                  }))
                }
              />

              <ReadOnlyCard
                title="Generated Attachment"
                fields={[
                  ["Transaction ID", emailForm.transactionId],
                  [
                    "Acknowledgment Letter",
                    emailForm.acknowledgmentLetter ?? "Not generated",
                  ],
                ]}
              />
            </section>
          )}
          <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
            <button
              onClick={goToPreviousStep}
              disabled={selectedWorkflow.currentStep === 1}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {selectedWorkflow.currentStep < 3 && (
              <button
                onClick={goToNextStep}
                className="rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Save and Continue
              </button>
            )}

            {selectedWorkflow.currentStep === 3 &&
              !selectedWorkflow.completed && (
                <button
                  onClick={completeStepThree}
                  className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Send Email and Mark Complete
                </button>
              )}

            {selectedWorkflow.completed && (
              <div className="rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                Transaction completed
              </div>
            )}
          </div>
          <br />
          <button onClick={toggleFooter}>
            {footerVisible ? "Hide Code Details" : "Show Code Details"}
          </button>
          <br />
        </main>

        {/* Footer should be hidden by default */}
        {footerVisible && (
          <footer>
            <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Multi-Step Transaction Workflow
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Transaction{" "}
                  <span className="font-medium">{selectedTransaction.id}</span>
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {renderStepIndicator("Customer & Donation Form", 1)}
                {renderStepIndicator("Acknowledgment Letter Draft", 2)}
                {renderStepIndicator("Email", 3)}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm">
              <div className="font-semibold">
                Selected Transaction Reference
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div>Donor: {selectedTransaction.donorName}</div>
                <div>Email: {selectedTransaction.donorEmail}</div>
                <div>Amount: ${selectedTransaction.amount.toFixed(2)}</div>
                <div>Beneficiary: {selectedTransaction.beneficiary}</div>
                <div>Donation Date: {selectedTransaction.donationDate}</div>
                <div>Status: {selectedTransaction.status}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <ObjectPreviewCard
                title="customerTransactionFormObject"
                value={selectedWorkflow.customerTransactionFormObject}
              />
              <ObjectPreviewCard
                title="acknowledgmentLetterFormObject"
                value={selectedWorkflow.acknowledgmentLetterFormObject}
              />
              <ObjectPreviewCard
                title="emailFormObject"
                value={selectedWorkflow.emailFormObject}
              />
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-black"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <textarea
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-black"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-3 py-2 outline-none ring-0 focus:border-black"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReadOnlyCard({
  title,
  fields,
}: {
  title: string;
  fields: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="text-sm">
            <span className="font-medium">{label}:</span> {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectPreviewCard({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-gray-800">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
