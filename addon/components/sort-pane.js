import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isEqual, isEmpty } from '@ember/utils';
import {
  get,
  getProperties,
  set,
  setProperties,
  computed,
  action
  } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { bind } from '@ember/runloop';
import { assert } from '@ember/debug';
import { htmlSafe } from '@ember/template';
import { Promise } from 'rsvp';
import ScrollContainer from '../classes/scroll-container';

export default class SortPaneComponent extends Component {

  sortPane = true;

  @service sortManager;
  
  @reads('sortManager.sourceList')
  sourceList
  
  @reads('sortManager.targetList')
  targetList
  
  @reads('sortManager.sourceIndex')
  sourceIndex
  
  @reads('sortManager.targetIndex')
  targetIndex
  
  @reads('sortManager.draggedItem')
  draggedItem
  
  @reads('sortManager.isDragging')
  isDragging
  
  @reads('sortManager.overOnTopHalf')
  overOnTopHalf
  
  @not('overOnTopHalf')
  overOnBottomHalf
  
  @reads('sortManager.currentOverIndex')
  currentOverIndex
  
  @not('isConnected')
  isNotConnected
  
  get scrollSpeed() {
    return this.args.scrollSpeed || 3
  }

  get scrollPane() {
    return this.args.scrollPane || '[sort-pane]'
  }
  
  @computed('sortManager.placeholderStyles')
  get placeholderStyles() {
    let styles = get(this, 'sortManager.placeholderStyles');
    let concatStyles = Object.keys(styles).map((prop) => {
      return ` ${prop}: ${styles[prop]}`;
    });
  
    return htmlSafe(concatStyles.join(';'));
  }
  
  @computed('sortManager.sourceGroup', 'group')
  get isConnected() {
    let currentGroup = this.args.group;
    let sourceGroup = get(this, 'sortManager.sourceGroup');
  
    return isEqual(currentGroup, sourceGroup);
  }
  
  @computed('sortManager.activeSortPane')
  get isActiveSortPane() {
    return isEqual(this, get(this, 'sortManager.activeSortPane'));
  }
  
  constructor() {
    super(...arguments);
  
    assert('tagName should not be empty ', isEmpty(this.tagName));
  
    this._onDragenter = bind(this, this._onDragenter);
    this._onDragleave = bind(this, this._onDragleave);
    this._drag = bind(this, this._drag);
  }
  
  @action
  registerListener(element) {
    let scrollPaneElement = element.closest(this.scrollPane);
    this.scrollContainer = new ScrollContainer(scrollPaneElement);

    this.element = element;
    // Registering Events
    element.addEventListener('dragEnter', this._onDragenter);
    element.addEventListener('dragLeave', this._onDragleave);
    element.addEventListener('drag', this._drag);
  }
  
  @action
  unregisterListener(element) {
    // Teardown Events
    element.removeEventListener('dragEnter', this._onDragenter);
    element.removeEventListener('dragLeave', this._onDragleave);
    element.removeEventListener('drag', this._drag);
  }
  
  _drag(ev) {
    if (!this.args.isDisabled) {
      let sortableContainer = get(this, 'sortManager.sortableContainer');
      let scrollContainer = this.scrollContainer;
    
      scrollContainer.handleScroll(sortableContainer);
    
      this.args.onDrag ? this.args.onDrag(ev, sortableContainer) : '';
    }
  }
  
  _onDragenter() {
    let {
      isNotConnected,
      isActiveSortPane
    } = getProperties(this, ['isNotConnected', 'isActiveSortPane']);
  
    if (isNotConnected || isActiveSortPane || this.args.isDisabled) {
      return;
    }
  
    set(this, 'sortManager.isDragEntered', true);
  
    let sortManager = this.sortManager;
    let targetList = this.args.items;
    let sourceList = get(sortManager, 'sourceList');
    let activeSortPane = this;
    let isSamePane = isEqual(sourceList, targetList);
    let targetIndex = get(targetList, 'length');
    // Math required to solve out of range index error
    let currentOverIndex = targetIndex - 1;
    // This will show placeholder at the End of the list
    // when we Enter the sort-pane's empty space
    let overOnTopHalf = false;
  
    if (isSamePane) {
      targetIndex = targetIndex - 1;
      currentOverIndex = currentOverIndex - 1;
    }
  
    setProperties(sortManager, {
      activeSortPane,
      targetList,
      targetIndex,
      currentOverIndex,
      overOnTopHalf
    });
  
    this.args.onDragenter ? this.args.onDragenter() : '';
  }
  
  _onDragleave() {
    setProperties(this, {
    'sortManager.activeSortPane': null,
    'sortManager.isDragEntered': false
    });
  
    this.args.onDragleave ? this.args.onDragleave() : '';
  }
  
  _resetSortManager() {
    this.sortManager.reset();
  }
  
  applyChanges(draggedItem, sourceList, sourceIndex, targetList, targetIndex) {
    sourceList.removeAt(sourceIndex);
    targetList.insertAt(targetIndex, draggedItem);
  }
  
  resetChanges(draggedItem, sourceList, sourceIndex, targetList, targetIndex) {
    targetList.removeAt(targetIndex);
    sourceList.insertAt(sourceIndex, draggedItem);
  }
  
  @action
  onDragStart(item, sourceIndex) {
    let sortManager = this.sortManager;
    let collection = this.args.items;
    let activeSortPane = this;
  
    setProperties(sortManager, {
      isDragging: true,
      sourceList: collection,
      targetList: collection,
      sourceIndex,
      targetIndex: sourceIndex,
      sourceGroup: this.args.group,
      draggedItem: item,
      activeSortPane
    });
  
    this.args.onDragStart ? this.args.onDragStart(item, collection, sourceIndex) : '';
  }
  
  @action
  onDragEnd() {
    this.args.onDragEnd ? this.args.onDragEnd(...arguments) : '';
  }
  
  @action
  onDragover() {
    this.args.onDragover ? this.args.onDragover(...arguments) : '';
  }
  
  @action
  onDrop(draggedElement) {
    let targetList = this.targetList;
    let targetIndex = this.targetIndex;
    let sourceList = this.sourceList;
    let sourceIndex = this.sourceIndex;
    let draggedItem = this.draggedItem;
  
    if (!(isEqual(sourceList, targetList) && isEqual(sourceIndex, targetIndex))) {
  
    this.applyChanges(draggedItem, sourceList, sourceIndex, targetList, targetIndex);
  
    let dropAction = new Promise((resolve) => {
      this.args.onDrop ? resolve(this.args.onDrop(draggedItem, sourceList, sourceIndex, targetList, targetIndex, draggedElement)) : resolve();
    });
  
    set(this, 'dropActionInFlight', true);
  
    dropAction.then((updateList = true) => {
      if (updateList === false && !(this.isDestroyed && this.isDestroying)) {
      this.resetChanges(draggedItem, sourceList, sourceIndex, targetList, targetIndex);
      }
    }).catch((/*err*/) => {
      // eslint-disable-next-line no-console
      // console.error(err);
      if (!(this.isDestroyed && this.isDestroying)) {
      this.resetChanges(draggedItem, sourceList, sourceIndex, targetList, targetIndex);
      }
    });
    }
  
    this._resetSortManager();
  }

}
