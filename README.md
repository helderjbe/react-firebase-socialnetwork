# Production steps

1 - Firebase Public Settings:
1.1 - Change Public-facing name for OAuth
1.2 - Change support e-mail
2 - Firebase Rules:
2.1 - Check rules for every request in app (search for "api." and analyze the requests)
2.2 - Check if rate limiting is needed
2.3 - Data validation
3 - Firebase Auth
3.1 - Set up Facebook Auth
4 - Firebase Quotas
4.1 - Set up quotas for firestore
4.2 - Configure Billing Account to remove quota restrictions
5 - Firebase production project
5.1 - Change env variables for production
5.2 - Change index name of algolia in functions

# TODO

Use react-redux-firebase + redux-firestore?

1 - Custom Password Reset landing page
2 - 404 page
3 - Add clearData (for users), when users delete an account.
4 - Make the side menu for desktop
5 - If user doesn't fill in the name, call it anonymous or something
