// Creating objects involved in the workflow for handling Stripe Transactions.

// Customer Transaction Form Object
// description: 
// References a subset of the fields from a Stripe Transaction object regarding customer and donation info which will be copied into the Customer Transaction Form Object in our app upon instantiation.
// Some of the fields can be edited by the treasurer (A customer has wrong spelling / nicknames for example).

// These are customer fields filled out in a Stripe Payment Link and which should be initially copied into the Customer Transaction Form Object when we create a new Customer Transaction Form Object based on a Stripe Transaction object:
// - email [editable]
// - phone [editable]
// - name [editable]
// - (optional) business name [editable]
// - (if credit card) billing address [editable]
// - (optional unless it's a custom donation) comments
// - (if credit card) last 4 digits of credit card

// These are additional fields not related to the original stripe transaction that we should be able to edit on the Customer Transaction Form:
// - internal comments (these are different from the user inputted comments on the stripe payment link, these are internal comments for our records that the treasurer can add about the transaction)
// - reason for transaction (refund, chargeback, etc.)

// These are stripe transaction fields related to a donation that cannot be edited, but they will be shown to the user on the Customer Transaction Form for reference and for copying into our internal records such as the spreadsheet in our nonprofit Dropbox:
// - Amount
// - Beneficiary
// - Donation Date


// This object fulfills these requirements:
// 1.The app allows users to edit paid out transaction info. 
// 2.The app allows users to provide additional data like comments to a paid out tx.
// 3.The app allows users to copy paid out tx info + additional info into an excel sheet in our nonprofit Dropbox.
const customerTransactionFormObject = {
    email: '',
    phone: '',
    name: '',
    businessName: '',
    billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    },
    customerComments: '',
    last4Digits: '',
    internalComments: '',
    reasonForTransaction: '', // refund, chargeback, etc.
    amount: 0,
    beneficiary: '',
    donationDate: null,
};


// Acknowledgment Letter Form Object
// This object fulfills these requirements:
// 1. The app allows users to use an input form that creates an acknowledgment letter with a custom message for a paid out tx. 
// 2. The app will automatically fill out paid out tx info that the user optionally edited into the input form that creates the acknowledgement letter. 
// 3. The app allows using different acknowledgment letter templates. 


// Email Form Object
// This object fulfills these requirements:
// 1. The app allows users to email a receipt with a filled acknowledgment letter attached for a paid out tx. 
// 2. The app allows users to edit subject, to, and message when sending receipt email. 
// 3. The subsystem should store emailed acknowledgment letters as pdfs in our nonprofit Dropbox. 