> Future
* Problems:
  * it seams that the height of snippet cards defends on the highest height of a card in a row, which makes all the card of that row same height as that of the one with longest height.
  * make the Uncategorized automatically unselected if any other category is selected
  * category reorder not being saved on cloud
* Enhancements:
  * give a full view of a selected snippet card along with its code/snippets
  * make an Admin user account that has the ability to see the no. of users(account) and manage those account like suspend,delete,etc
  * make the top/starting of a snippetcard easily recognizable 

> 17/10/25
* Fixed:
  * code of new snippet not being saved on cloud
  * new category not being saved on cloud
  * account being suspended (unable to login)
  * snippets not being visible until Refresh button is clicked
* Enhanced:
  * Description field now supports multiline inputs/text
  * Description field now supports markdown
* New:
  * skeleton loaders
* Removed:
  * the Firestore offline/online cycling

> 9/10/25
* major changes were made from this updates onwards
* rollback to previous update to undo:
  * acount (mail) id/pass login
  * etc
* create a login/signup page where, Firebase handles the account & password security.
* store user-related data separately in Firestore/Realtime DB along with their snippets.
