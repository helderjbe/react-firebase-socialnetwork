# Production steps

1 - Firebase Public Settings:
1.1 - Change Public-facing name for OAuth
1.2 - Change support e-mail
2 - Firebase Rules:
2.1 - Check rules for every request in app (search for "api." and analyze the requests)
2.2 - Data validation
3 - Firebase Auth
3.1 - Set up Facebook Auth
3.2 - Set up custom domain for Email templates
3.3 - Test Reset Password, Verify Email, Change Email
4 - Firebase Quotas
4.1 - Set up quotas for firestore
5 - Firebase production project
5.1 - Change env variables for production

https://www.algolia.com/doc/guides/going-to-production/implementation-checklist/

# TODO

Use react-redux-firebase + redux-firestore?

2 - Sidebar navigation
3 - Add clearData (for users), when users delete an account.
4 - Make the side menu for desktop
6 - Form validation
