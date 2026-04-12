// Creating objects involved in the workflow for handling Stripe Transactions.

// Custom Transaction Form Object
// description: References a dummy stripe transaction object, and a user can override some of the fields that are not required by the Stripe API, such as metadata or merchant_data. 
// This information can be used on top of the dummy transaction for internal records such as updating the customer's nicknames or adding internal notes about the transaction. The form can also include fields for the user to specify the reason for the transaction, such as a refund or a chargeback, which can be used for internal reporting and analysis.
// This object fulfills these requirements:
// 1.The app allows users to edit paid out transaction info. 
// 2.The app allows users to provide additional data like comments to a paid out tx.
// 3.The app allows users to copy paid out tx info + additional info into an excel sheet in our nonprofit Dropbox.


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