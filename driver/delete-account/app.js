(function () {
  'use strict';

  const config = window.NITRO_FIREBASE_CONFIG;
  const warning = document.querySelector('#configuration-warning');
  const signedOutPanel = document.querySelector('#signed-out-panel');
  const signedInPanel = document.querySelector('#signed-in-panel');
  const signInButton = document.querySelector('#sign-in-button');
  const deleteButton = document.querySelector('#delete-button');
  const cancelButton = document.querySelector('#cancel-button');
  const signOutButton = document.querySelector('#sign-out-button');
  const accountEmail = document.querySelector('#account-email');
  const message = document.querySelector('#message');

  if (!config || !config.apiKey || config.apiKey.indexOf('REPLACE_') === 0) {
    warning.hidden = false;
    signInButton.disabled = true;
    return;
  }

  const app = firebase.initializeApp(config);
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  function showMessage(text, isError) {
    message.textContent = text;
    message.className = isError ? 'message message-error' : 'message';
    message.hidden = false;
  }

  function clearMessage() {
    message.hidden = true;
    message.textContent = '';
  }

  function getGoogleSignInErrorMessage(error) {
    switch (error && error.code) {
      case 'auth/unauthorized-domain':
        return 'This local website address is not authorized in Firebase. Add the current address under Firebase Authentication → Settings → Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'Google Sign-In is not enabled for this Firebase project.';
      case 'auth/popup-blocked':
        return 'The browser blocked the Google Sign-In window. Allow pop-ups for this page and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/network-request-failed':
        return 'Firebase could not be reached. Check the internet connection and try again.';
      default:
        return 'Could not sign in with Google (' +
          (error && error.code ? error.code : 'unknown error') +
          '). Please check the browser console for details.';
    }
  }

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function renderUser(user) {
    const signedIn = Boolean(user);
    signedOutPanel.hidden = signedIn;
    signedInPanel.hidden = !signedIn;
    if (user) accountEmail.textContent = user.email || 'your Google account';
  }

  auth.onAuthStateChanged(renderUser);

  signInButton.addEventListener('click', function () {
    clearMessage();
    setBusy(signInButton, true, 'Signing in…');
    auth.signInWithPopup(provider)
      .catch(function (error) {
        showMessage(getGoogleSignInErrorMessage(error), true);
      })
      .finally(function () {
        setBusy(signInButton, false);
      });
  });

  cancelButton.addEventListener('click', function () {
    clearMessage();
    renderUser(auth.currentUser);
  });

  signOutButton.addEventListener('click', function () {
    clearMessage();
    auth.signOut().catch(function () {
      showMessage('Could not sign out. Please try again.', true);
    });
  });

  deleteButton.addEventListener('click', function () {
    const user = auth.currentUser;
    if (!user) {
      showMessage('Please sign in again before deleting your account.', true);
      return;
    }

    if (!window.confirm('Delete the Nitro account for ' +
      (user.email || 'this Google account') + '? This cannot be undone.')) {
      return;
    }

    setBusy(deleteButton, true, 'Deleting…');
    clearMessage();

    user.delete()
      .then(function () {
        showMessage('Your Nitro account was deleted. Signing in with Google again will create a new account; it will not restore this one.');
      })
      .catch(function (error) {
        if (error.code === 'auth/requires-recent-login') {
          return user.reauthenticateWithPopup(provider)
            .then(function () { return user.delete(); })
            .then(function () {
              showMessage('Your Nitro account was deleted. Signing in with Google again will create a new account; it will not restore this one.');
            })
            .catch(function (reauthError) {
              showMessage(reauthError.code === 'auth/popup-closed-by-user'
                ? 'Sign-in was cancelled. Your account was not deleted.'
                : 'Recent sign-in is required. Your account was not deleted.', true);
            });
        }
        showMessage('We could not delete your account. Please check your connection and try again.', true);
      })
      .finally(function () {
        setBusy(deleteButton, false);
      });
  });
}());
