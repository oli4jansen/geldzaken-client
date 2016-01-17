(function() {
  'use strict';

  angular
    .module('geldzakenAngular')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $window, authorization, amMoment) {
    authorization.listenForStateChange();

    amMoment.changeLocale('nl');

    $window.i18n = {
      'Overview': 'Overzicht',
      'Groups': 'Groepen',
      'Log out': 'Log uit',
      'Log in': 'Log in',
      'Sign up': 'Registreer',
      'Settings': 'Instellingen',
      'Settings were saved!': 'Instelligen opgeslagen!',
      'Can\'t save settings!': 'Instellingen konden niet worden opgeslagen.',
      'Can\'t delete account!': 'Kon account niet verwijderen.',
      'Payments': 'Betalingen',
      'Members': 'Leden',
      'Cancel': 'Annuleer',
      'Are you sure?': 'Weet je het zeker?',
      'Settling a group cannot be reverted.': 'Afrekenen kan niet teruggedraaid worden.',
      'Settle': 'Afrekenen',
      'Settle group': 'Reken groep af',
      'Group was settled!': 'Groep is afgerekend!',
      'Create a group': 'Nieuwe groep',
      'Create group': 'Maak groep',
      'Leave group': 'Verlaat groep',
      'Left group!': 'Groep verlaten!',
      'Could not leave group.': 'Kon groep niet verlaten.',
      'Add member': 'Nieuw lid',
      'Member was added!': 'Lid is toegevoegd!',
      'But won\'t be visible until he/she confirms.': 'Maar verschijnt pas als hij/zij accepteert.',
      'Add': 'Voeg toe',
      'Add payment': 'Nieuwe betaling',
      'Amount': 'Bedrag',
      'Payed by': 'Betaald door',
      'Short description': 'Korte beschrijving',
      'Everyone': 'Iedereen',
      'Reset': 'Reset',
      'Payment was added!': 'Betaling toegevoegd!',
      'This group doesn\'t have any payments yet.': 'Er zijn nog geen betalingen gedaan.',
      'Delete payment': 'Verwijder betaling',
      'Delete': 'Verwijder',
      'Payed for': 'Betaald voor',
      'There are no payments made in this group.': 'Er zijn geen betalingen gedaan in deze groep.',
      'Could not settle.': 'Kon niet afrekenen.',
      'Signed up!': 'Geregistreerd!',
      'You can now log in.': 'Je kunt nu inloggen.',
      'Okay!': 'Oke!',
      'Account': 'Account',
      'Bankaccount number': 'Bankrekening nummer',
      'Email address': 'E-mailadres',
      'Password': 'Wachtwoord',
      'New password': 'Nieuw wachtwoord',
      'Save': 'Opslaan',
      'Delete account': 'Verwijder account',
      'This is required.': 'Dit is verplicht.',
      'I already have an account': 'Ik heb al een account',
      'I don\'t have an account': 'Ik heb geen account',
      'Make sure your email address is valid.': 'Zorg ervoor dat je e-mailadres klopt.',
      'We only show this to your group members.': 'We delen dit alleen met groepsgenoten.',
      'When you settle a group, we calculate the transactions needed to get all balances to zero and mail them to all participants.': 'Als je een groep afrekent, berekenen wij welke transacties nodig zijn om ieders balans weer op 0 te zetten. Alle leden krijgen hiervan een overzicht gemaild.',
      'Name': 'Naam',
      'Balance': 'Stand',
      'Confirm': 'Bevestig',
      'Reject': 'Negeer',
      'Your groups': 'Jouw groepen',
      'New groups': 'Nieuwe groepen',
      'Creation date': 'Opricht datum',
      'Created': 'Gemaakt',
      'Last updated': 'Laatst gewijzigd',
      '{num} members': function (d) { return d.num + ' leden' },
      'You are not in any groups yet! When you are, they will appear here.': 'Je hebt op dit moment nog geen groepen. Zodra dit verandert, verschijnen ze hier.'
    }
  }

})();
