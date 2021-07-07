This is a fork of https://github.com/venkateshg5887/ember-sortable updated to support freshservice's use cases.
In the future we will try to merge this with the parent branch.
ember-drag-drop-sort
==============================================================================

Ember addon to drag drop sort within swinlanes.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-drag-drop-sort
```


Usage
------------------------------------------------------------------------------

template file
```hbs
  <SortPane @group={{1}} @onDrop={{this.test}} @items={{this.model.squadA}} as |sortable|>
    <sortable.item as |item|>
      {{item.content}}
    </sortable.item>
  </SortPane>
  <SortPane @group={{1}} @containment=".kanban-board" @items={{this.model.squadB}} as |sortable|>
    <sortable.item as |item|>
      {{item.content}}
    </sortable.item>
  </SortPane>
```

component.js file
```js
get model()  {
	return {
		squadA: A(['Ghanesh', 'Shyam', 'Karthick Kalyanasundaram', 'Rajesh']),
		squadB: A(['Prathees', 'Venkatesh', 'Albert', 'Ramya', 'Prathees', 'Venkatesh', 'Albert', 'Ramya')
	}
}
```

Improvements done to support freshservice
 octane upgrade (is available as separate PR as well.) - https://github.com/Robin-Thomas-577/ember-sortable/tree/v1-ember-octane-upgrade
<!-- * Horizontal sorting - This is commented for now-->

Bugs and performance fixes done
1) Dragging a card from the bottom seems to set the placeholder in the wrong position.
2) as soon as mouse down happens cloning of the element is done. Moving this to only on start dragging happens, since we have quick actions on the card.