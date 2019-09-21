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
6 - Name
6.1 - Change name in manifest
6.2 - Change name in src
6.3 - Change name in title
7 - Icons
7.1 - Change favicons, manifest.json
7.2 - Add logo instead of name in main page

# TODO

Hooks
Refactor imports

3 - Add clearData (for users), when users delete an account.
