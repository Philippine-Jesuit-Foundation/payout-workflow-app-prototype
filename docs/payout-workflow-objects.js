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
// - Transaction ID


// This object fulfills these requirements:
// 1.The app allows users to edit paid out transaction info. 
// 2.The app allows users to provide additional data like comments to a paid out tx.
// 3.The app allows users to copy paid out tx info + additional info into an excel sheet in our nonprofit Dropbox.
const customerTransactionFormObject = {
    transactionId: '', // from Stripe Transaction object, not editable
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
// description:
// This object represents the form for creating an acknowledgment letter for a paid out transaction. 
// It includes fields for the custom message, paid out transaction info, and template selection for the acknowledgment letter. The app will use this form to generate a filled acknowledgment letter that can be attached to a receipt email or stored as a PDF in our nonprofit Dropbox.
// This object is dependent on the Customer Transaction Form Object, as it will pull in the paid out transaction info from the Customer Transaction Form Object to automatically fill out the acknowledgment letter. The user cannot edit the paid out transaction info in the Acknowledgment Letter Form Object, but they can edit the custom message and select the template for the acknowledgment letter.

// This object fulfills these requirements:
// 1. The app allows users to use an input form that creates an acknowledgment letter with a custom message for a paid out tx. 
// 2. The app will automatically fill out paid out tx info that the user optionally edited into the input form that creates the acknowledgement letter. 
// 3. The app allows using different acknowledgment letter templates. 
const acknowledgmentLetterFormObject = {
    transactionId: '', // from Stripe Transaction object, not editable
    customMessage: '',
    // paid out transaction info pulled from the Customer Transaction Form Object (not editable in this form)
    name: '',
    email: '',
    amount: 0,
    beneficiary: '',
    donationDate: null,
    // template selection for the acknowledgment letter
    template: 'default', // default template, but we can have other templates like 'business_donation', 'large_donation', etc.
};


// Email Form Object
// description:
// This object represents the form for sending a receipt email with a filled acknowledgment letter attached for a paid out transaction. 
// Dependent on acknowledgment Letter Form Object, as it will pull in the filled acknowledgment letter generated from the Acknowledgment Letter Form Object to attach to the receipt email. The user can edit the subject, to, and message fields when sending the receipt email. When the user sends the receipt email, the app will also store the emailed acknowledgment letter as a PDF in our nonprofit Dropbox for record-keeping purposes.

// This object fulfills these requirements:
// 1. The app allows users to email a receipt with a filled acknowledgment letter attached for a paid out tx. 
// 2. The app allows users to edit subject, to, and message when sending receipt email. 
// 3. The subsystem should store emailed acknowledgment letters as pdfs in our nonprofit Dropbox. 
const emailFormObject = {
    transactionId: '', // from Stripe Transaction object, not editable
    subject: '',
    to: '',
    message: '',
    // filled acknowledgment letter generated from the Acknowledgment Letter Form Object (not editable in this form)
    acknowledgmentLetter: null, // this will be a PDF file or a link to the PDF file stored in our nonprofit Dropbox
};

