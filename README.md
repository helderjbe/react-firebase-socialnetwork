# Production steps

1 - Firebase Public Settings:
1.1 - Change Public-facing name for OAuth
1.2 - Change support e-mail
3 - Firebase Auth
3.0 - Enable Google auth
3.1 - Set up Facebook Auth
3.2 - Set up custom domain for Email templates
3.3 - Set up custom domain name for Google Auth Redirect (add to Authorised domains in console)
5 - Firebase production project
5.1 - Change env variables for production
6 - Name
6.1 - Change name in manifest
6.2 - Change name in src
6.3 - Change name in title
6.4 - Change name in Privacy policy
7 - Icons
7.1 - Change favicons, manifest.json
7.2 - Add logo instead of name in main page
8 - Analytics

# TODO

Check written notes
Hooks
Refactor imports

3 - Add clearData (for users), when users delete an account.

![Flofus Logo](./public/android-chrome-512x512.png)

# Foobar

Foobar is a Python library for dealing with word pluralization.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```

## Usage

```python
import foobar

foobar.pluralize('word') # returns 'words'
foobar.pluralize('goose') # returns 'geese'
foobar.singularize('phenomena') # returns 'phenomenon'
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
