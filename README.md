[![Flofus Logo](./public/android-chrome-192x192.png)](https://flofus.com/)

# Flofus - React/Firebase/Material UI/Algolia

Flofus is an open source social network based on groups. You can apply to join, create and quit groups. Once you join a group you can chat in a messenger-like section with other members of the group. Built with **React, Firebase, Material UI, Algolia**.

## Features

- Create / Apply to join / Leave groups
- Full-text search ([Algolia](https://www.algolia.com/)): By title, by description, by tags
- Add banners to groups and stores in Firebase Storage (uses custom auth tokens)
- Messenger-like chat with members - all in Firestore
- Administrate group: ban, promote a member to admin, edit rules of the group and view applications
- Real-time notifications: when a user applies to a group and when accepted
- Profile management: edit own details and upload image avatar
- Google, facebook auth and email/password login

# [View live](https://flofus.com/)

## Requirements

- [A Firebase project](https://firebase.google.com/) (to use algolia in cloud functions you need Blaze plan - free as well)
- [An algolia account](https://www.algolia.com/users/sign_up)

## Installation

1. Clone the project `git clone https://github.com/helderjbe/react-firebase-socialnetwork.git`
2. Run `npm install && cd functions && npm install && cd ..`
3. [Install Firebase CLI if you haven't already](https://firebase.google.com/docs/cli)
   1. Create a project in firebase
   2. Run `firebase init` and follow instructions
4. Create a _.env_ file and fill in the following:

```
REACT_APP_API_KEY=[Your firebase API KEY]
REACT_APP_AUTH_DOMAIN=[Your firebase project domain]
REACT_APP_DATABASE_URL=[Your firebase database url]
REACT_APP_PROJECT_ID=[Your firebase project id]
REACT_APP_STORAGE_BUCKET=[Your firebase storage bucket url]

REACT_APP_ALGOLIA_APP_ID=[Your algolia app id]
REACT_APP_ALGOLIA_SEARCH_KEY=[Your algolia search key]
REACT_APP_ALGOLIA_INDEX_NAME=[Your algolia index name (you have to create one in your dashboard)]
```

5. Firebase functions require a config of its own for some reason, but it's easy anyway. Run:

```bash
firebase functions:config:set algolia.api_key=[YOUR ALGOLIA API KEY] && \
firebase functions:config:set algolia.app_id=[YOUR ALGOLIA APP ID] && \
firebase functions:config:set algolia.index_name=[YOUR ALGOLIA INDEX NAME]
```

6. Run `npm start` and enjoy

## Optional

To set up Google auth and Facebook auth you need to activate it in the Firebase Auth section

## Contributing

Pull requests are welcome and much needed.
For major changes though, please open an issue first to discuss what you would like to change.

## TODO

Priority: **High**

- The last admin to leave a group should pass admin rights to another user
- Subscribe to new messages when viewing groups to get real-time updates outside of the chat

Priority: **Medium**

- Correct accessiblity bugs

Priority: **Low**

- Refactor code with React Hooks (remove components)
- Redo imports (warnings concerning unused imports)
- Add redux store to manipulate data more easily

## New feature ideas

- Delete user data upon request
- Push notifications
- Upload images, video & audio in chat
- Report groups
- Site-wide administration
- Email notifications

## License

[MIT](https://choosealicense.com/licenses/mit/)
