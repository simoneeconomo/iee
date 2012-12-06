# Improved Entry Editor (IEE)

Improved Entry Editor allows you to re-order fields from _inside_ the Entry Editor by means of a drag-and-drop interface. It also lets you collapse and expand fields in a Duplicator-like fashion.

There are a bunch of reasons why you could benefit from this extension:

* **Behaviour First, Appearance Later**: Defining a field's behaviour is conceptually different from changing its appearance. As such, these two tasks should be kept separate and perfomed in two distinct places.

* **Trial and Error**: You don't always know a priori which is the best way (i.e. the one that feels _right_ to you) to place a field in a layout. You need to try one, fail, then try again.

* **Instant feedback**: Jumping from the Section Editor to the Entry Editor and viceversa is time consuming. Even if you keep two tabs open, you need to change the look of a page from within another page, then refresh the latter to see the outcome.

If any of that feels wrong to you, then Improved Entry Editor may prove very handy. It separates behaviour from appearance, supports a process of trial and error and gives you instant feedback on your actions. Give it a go!

## Installation & Updating

Information about [installing and updating extensions](http://symphony-cms.com/learn/tasks/view/install-an-extension/) can be found in the Symphony documentation at <http://symphony-cms.com/learn/>.

## Usage

1. Create or edit an entry made of some fields.
2. To _re-order_ a field, click on the field's label, keep the mouse button down and drag the box around to reveal the available placeholders.
   - Every time you drop a field, the new order is saved to the database and will affect everyone.
3. To _collapse_/_expand_ a field, perform a simple click on the field's label without moving it.
   - Every time you toggle a field, the new state is saved to the filesystem using `localStorage` on a per-device basis.
